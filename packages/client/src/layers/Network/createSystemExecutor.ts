import {
  Entity,
  HasValue,
  getComponentValueStrict,
  hasComponent,
  runQuery,
  setComponent,
  updateComponent,
} from "@latticexyz/recs";
import { setupNetwork } from "../../mud/setupNetwork";
import { ContractType, useStore } from "../../useStore";
import { Hex, formatEther } from "viem";
import { createClientComponents } from "../../mud/createClientComponents";
import lodash from "lodash";
import { uuid } from "@latticexyz/utils";
import { getTransaction } from "viem/actions";
import { ANALYTICS_URL } from "./utils";
import { skystrifeDebug } from "../../debug";

const { sortBy, filter } = lodash;

const debug = skystrifeDebug.extend("system-executor");

type CreateSystemExecutorArgs = {
  worldContract: ContractType;
  network: Awaited<ReturnType<typeof setupNetwork>>;
  components: ReturnType<typeof createClientComponents>;
  calculateMeanTxResponseTime: () => number;
  sendAnalytics?: boolean;
};

type SystemExecutorArgs<T extends keyof ContractType["write"]> = {
  // The literal system that will be called on the Contract
  systemCall: T;
  // Human readable ID for use in A) analytics and B) determining gas estimate from past txs
  // This is needed because callFrom and batchCall can't be used as unique identifiers but are the
  // top level system names.
  systemId?: string;
  args: Parameters<ContractType["write"][T]>;
  entity?: Entity;
  options?: {
    /**
     * Used to tie together a series of transactions that are part of the same action. This happens when there is a retry on transaction failure.
     * There is no need to pass this as an option, it will be generated on the first call and then
     * passed in the options on subsequent calls.
     */
    actionId?: string;
    currentRetryCount?: number;
    disableRetry?: boolean;
    worldContractOverride?: ContractType;
    forceManualGasEstimate?: boolean;
    disableNonceManager?: boolean;
  };
  confirmCompletionCallback?: () => Promise<void>;
  onRevertCallback?: () => Promise<void>;
};

export const createSystemExecutor = ({
  worldContract,
  network,
  components,
  sendAnalytics,
  calculateMeanTxResponseTime,
}: CreateSystemExecutorArgs) => {
  let latestBlock = 0n;
  network.latestBlock$.subscribe((block) => {
    if (!block.number) return;

    latestBlock = block.number;
  });

  const sendTxAnalytics = async (txEntity: Entity) => {
    const txData = getComponentValueStrict(components.Transaction, txEntity);
    debug(`Sending tx analytics`, txData);

    let gasPrice = 0n;
    if (txData.hash) {
      const txDetails = await getTransaction(network.txReceiptClient, {
        hash: txData.hash as Hex,
      });

      if (txDetails.gasPrice) {
        gasPrice = txDetails.gasPrice;
        updateComponent(components.Transaction, txEntity, {
          gasPrice,
        });
      }
    }

    const chainId = network.networkConfig.chain.id;
    const { address } = worldContract;
    const { externalWalletClient } = useStore.getState();
    const playerAddress = externalWalletClient?.account?.address;

    const {
      entity,
      systemCall,
      systemId,
      gasEstimate,
      manualGasEstimate,
      status,
      hash,
      error,
      submittedBlock,
      completedBlock,
      submittedTimestamp,
      completedTimestamp,
      actionId,
      clientSubmittedTimestamp,
    } = txData;

    const body = JSON.stringify({
      entity,
      system_call: systemCall,
      system_id: systemId,
      action_id: actionId,
      gas_estimate: Number(gasEstimate ?? 0n),
      manual_gas_estimate: manualGasEstimate,
      gas_price_gwei: Number(formatEther(gasPrice ?? 0n, "gwei")),
      status,
      hash,
      error: error ?? null,
      submitted_block: Number(submittedBlock ?? 0n),
      completed_block: Number(completedBlock ?? 0n),
      submitted_timestamp: Number(submittedTimestamp ?? 0n),
      client_submitted_timestamp: Number(clientSubmittedTimestamp ?? 0n),
      completed_timestamp: Number(completedTimestamp ?? 0n),
      player_address: playerAddress ?? null,
      match_entity: network.matchEntity,
      session_wallet_address: network.walletClient?.account?.address,
    });

    try {
      const response = await fetch(`${ANALYTICS_URL}/track/${chainId}/${address}`, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      return response;
    } catch (e) {
      console.warn("Failed to send tx analytics", e);
    }

    return undefined;
  };

  const executeSystem = async <T extends keyof ContractType["write"]>({
    entity,
    systemCall,
    systemId,
    args,
    options,
    confirmCompletionCallback,
    onRevertCallback,
  }: SystemExecutorArgs<T>): Promise<Hex | undefined> => {
    const actionId = options?.actionId ?? (uuid() as string);
    const disableRetry = options?.disableRetry ?? false;
    const currentRetryCount = options?.currentRetryCount ?? 0;
    const contract = options?.worldContractOverride ?? worldContract;
    const forceManualGasEstimate = options?.forceManualGasEstimate ?? false;
    const disableNonceManager = Boolean(options?.disableNonceManager);
    systemId = systemId ?? systemCall.toString();

    const txEntity = uuid() as Entity;

    debug(`Executing action ${systemId}(${systemCall})`);

    // Action groups together many transactions as one "user intended action"
    if (!hasComponent(components.Action, actionId as Entity)) {
      debug(`Beginning new action ${actionId}`);
      setComponent(components.Action, actionId as Entity, {
        entity,
        type: systemId,
        status: "pending",
      });
    }

    setComponent(components.Transaction, txEntity, {
      status: "pending",
      entity,
      systemCall: systemCall as string,
      systemId,
      actionId,
      gasEstimate: undefined,
      manualGasEstimate: false,
      gasPrice: undefined,
      hash: undefined,
      error: undefined,
      submittedTimestamp: undefined,
      completedTimestamp: undefined,
      submittedBlock: undefined,
      completedBlock: undefined,
      clientSubmittedTimestamp: undefined,
    });

    updateComponent(components.Transaction, txEntity, {
      submittedTimestamp: BigInt(Date.now()),
      clientSubmittedTimestamp: BigInt(network.clock.currentTime),
    });

    let gasEstimate = 0n;

    if (!forceManualGasEstimate) {
      debug("Attempting to set gas estimate based on previous successful txs of same type");
      const previousTxsOfSameSystemCall = [...runQuery([HasValue(components.Transaction, { systemId })])].map((tx) => {
        const txData = getComponentValueStrict(components.Transaction, tx);
        return {
          ...txData,
          entity: tx,
        };
      });
      const mostRecentNonPendingTx = sortBy(
        filter(previousTxsOfSameSystemCall, (tx) => ["completed", "reverted"].includes(tx.status)),
        (tx) => tx.completedTimestamp,
      ).reverse()[0];

      // in this case we have a successful tx, so we use the cached gas estimate
      if (
        mostRecentNonPendingTx &&
        mostRecentNonPendingTx.status !== "reverted" &&
        mostRecentNonPendingTx.gasEstimate
      ) {
        debug(`Successfully found gas estimate ${mostRecentNonPendingTx.gasEstimate.toString()}`);
        gasEstimate = mostRecentNonPendingTx.gasEstimate;
      } else {
        debug("Could not find previous gas estimate.");
      }
    }

    const systemArgs = args[0];
    let txOptions = args[1] || {};
    const defaultParameters = {
      chain: network.networkConfig.chain,
      ...(network.networkConfig.chain?.fees ? { type: "eip1559" } : {}),
    };

    let txHash: Hex | undefined;
    try {
      if (gasEstimate === 0n) {
        if (network.networkConfig.chain.id === 31337) {
          debug("Manually setting 0 fees for local anvil chain");
          txOptions = {
            ...txOptions,
            maxFeePerGas: 0n,
            maxPriorityFeePerGas: 0n,
          };
        }

        try {
          debug("Attempting to manually estimate gas");
          const estimateFunction = contract.estimateGas[systemCall];
          const gasEstimateOptions = {
            ...txOptions,
            ...defaultParameters,
            maxFeePerGas: 0n,
            maxPriorityFeePerGas: 0n,
            blockTag: "pending",
          } as any;
          if (!disableNonceManager) {
            debug(`Manually setting nonce to prevent extra network calls in viem`);
            const nonce = network.walletNonceManager.getNonce();
            gasEstimateOptions["nonce"] = nonce;
          }

          gasEstimate = await ((estimateFunction as any)(systemArgs, gasEstimateOptions) as Promise<bigint>);
          debug(`Successfully estimated gas: ${gasEstimate.toString()}`);
        } catch (e) {
          debug(`Manual gas estimation failed.`);
          updateComponent(components.Transaction, txEntity, {
            status: "reverted",
            completedTimestamp: BigInt(Date.now()),
            error: (e as Error).toString().replaceAll(",", "").replaceAll("\n", " "),
          });

          // we early return here because if we failed gas estimation
          // it is a truly invalid action
          throw e;
        }

        updateComponent(components.Transaction, txEntity, {
          manualGasEstimate: true,
        });
      }

      updateComponent(components.Transaction, txEntity, {
        gasEstimate,
      });

      debug(`Submitting tx...`);
      const txPromise = (contract.write[systemCall] as any)(systemArgs, {
        ...txOptions,
        gas: gasEstimate,
      }) as Promise<Hex>;

      const txHash = await txPromise;
      debug(`Successfully submitted tx with hash ${txHash}`);
      updateComponent(components.Transaction, txEntity, {
        status: "submitted",
        submittedBlock: latestBlock,
        hash: txHash,
      });

      if (confirmCompletionCallback) {
        confirmCompletionCallback().then(() => {
          updateComponent(components.Transaction, txEntity, {
            completedTimestamp: BigInt(Date.now()),
          });
        });
      }

      debug(`Waiting for transaction to reduce...`);
      await network.waitForTransaction(txHash);
      debug(`Transaction reduction complete.`);

      updateComponent(components.Transaction, txEntity, {
        status: "completed",
        hash: txHash,
        completedTimestamp: BigInt(Date.now()),
        completedBlock: latestBlock,
      });
      updateComponent(components.Action, actionId as Entity, {
        status: "completed",
      });
    } catch (e) {
      debug(`Tx reverted. Hash: ${txHash}`);
      updateComponent(components.Transaction, txEntity, {
        status: "reverted",
        error: (e as Error).toString().replaceAll(",", "").replaceAll("\n", " "),
        completedTimestamp: BigInt(Date.now()),
      });

      if (disableRetry || currentRetryCount + 1 > 1) {
        debug(`Not retrying, reverting.`);
        onRevertCallback?.();
        updateComponent(components.Action, actionId as Entity, {
          status: "failed",
        });
        throw e;
      } else {
        debug(`Can retry tx, attempting again. Retry count ${currentRetryCount + 1}`);
        txHash = await executeSystem({
          entity,
          systemCall,
          systemId,
          args,
          options: {
            actionId,
            currentRetryCount: currentRetryCount + 1,
          },
          confirmCompletionCallback,
          onRevertCallback,
        });
      }
    }

    if (sendAnalytics) {
      sendTxAnalytics(txEntity);
    }

    const meanTxResponseTime = calculateMeanTxResponseTime();
    network.responseTime.updateMeanResponseTime(meanTxResponseTime);

    return txHash;
  };

  const executeSystemWithExternalWallet = async <T extends keyof ContractType["write"]>(
    args: Omit<SystemExecutorArgs<T>, "options">,
  ): Promise<Hex | undefined> => {
    const { externalWorldContract } = useStore.getState();

    if (!externalWorldContract) {
      throw new Error("No external world contract");
    }

    return executeSystem({
      ...args,
      options: {
        worldContractOverride: externalWorldContract,
        disableRetry: true,
        forceManualGasEstimate: true,
        disableNonceManager: true,
      },
    });
  };

  return {
    executeSystem,
    executeSystemWithExternalWallet,
  };
};
