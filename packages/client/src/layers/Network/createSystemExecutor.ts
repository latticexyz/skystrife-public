import { Entity, HasValue, getComponentValueStrict, runQuery, setComponent, updateComponent } from "@latticexyz/recs";
import { setupNetwork } from "../../mud/setupNetwork";
import { ContractType } from "../../useMUD";
import { useStore } from "../../useStore";
import { Hex, formatEther } from "viem";
import { createClientComponents } from "../../mud/createClientComponents";
import lodash from "lodash";
import { uuid } from "@latticexyz/utils";
import { getTransaction } from "viem/actions";
import { ANALYTICS_URL } from "./utils";

const { sortBy, filter } = lodash;

type CreateSystemExecutorArgs = {
  worldContract: ContractType;
  network: Awaited<ReturnType<typeof setupNetwork>>;
  components: ReturnType<typeof createClientComponents>;
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
    currentRetryCount?: number;
    disableRetry?: boolean;
    worldContractOverride?: ContractType;
    forceManualGasEstimate?: boolean;
  };
  confirmCompletionCallback?: () => Promise<void>;
};

export const createSystemExecutor = ({
  worldContract,
  network,
  components,
  sendAnalytics,
}: CreateSystemExecutorArgs) => {
  let latestBlock = 0n;
  network.latestBlock$.subscribe((block) => {
    if (!block.number) return;

    latestBlock = block.number;
  });

  const sendTxAnalytics = async (txEntity: Entity) => {
    const txData = getComponentValueStrict(components.Transaction, txEntity);

    let gasPrice = 0n;
    if (txData.hash) {
      const txDetails = await getTransaction(network.walletClient, {
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
    } = txData;

    const body = JSON.stringify({
      entity,
      system_call: systemCall,
      system_id: systemId,
      gas_estimate: Number(gasEstimate ?? 0n),
      manual_gas_estimate: manualGasEstimate,
      gas_price_gwei: Number(formatEther(gasPrice ?? 0n, "gwei")),
      status,
      hash,
      error: error ?? null,
      submitted_block: Number(submittedBlock ?? 0n),
      completed_block: Number(completedBlock ?? 0n),
      submitted_timestamp: Number(submittedTimestamp ?? 0n),
      completed_timestamp: Number(completedTimestamp ?? 0n),
      player_address: playerAddress ?? null,
      match_entity: network.matchEntity,
      session_wallet_address: network.walletClient.account.address,
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
  }: SystemExecutorArgs<T>): Promise<Hex | undefined> => {
    const disableRetry = options?.disableRetry ?? false;
    const currentRetryCount = options?.currentRetryCount ?? 0;
    const contract = options?.worldContractOverride ?? worldContract;
    const forceManualGasEstimate = options?.forceManualGasEstimate ?? false;
    systemId = systemId ?? systemCall.toString();

    const txEntity = uuid() as Entity;

    setComponent(components.Transaction, txEntity, {
      status: "pending",
      entity,
      systemCall,
      systemId,
      gasEstimate: undefined,
      manualGasEstimate: false,
      gasPrice: undefined,
      hash: undefined,
      error: undefined,
      submittedTimestamp: undefined,
      completedTimestamp: undefined,
      submittedBlock: undefined,
      completedBlock: undefined,
    });

    updateComponent(components.Transaction, txEntity, {
      submittedTimestamp: BigInt(Date.now()),
    });

    let gasEstimate = 0n;

    if (!forceManualGasEstimate) {
      const previousTxsOfSameSystemCall = [...runQuery([HasValue(components.Transaction, { systemId })])].map((tx) => {
        const txData = getComponentValueStrict(components.Transaction, tx);
        return {
          ...txData,
          entity: tx,
        };
      });
      const mostRecentNonPendingTx = sortBy(
        filter(previousTxsOfSameSystemCall, (tx) => ["completed", "reverted"].includes(tx.status)),
        (tx) => tx.completedTimestamp
      ).reverse()[0];

      // in this case we have a successful tx, so we use the cached gas estimate
      if (
        mostRecentNonPendingTx &&
        mostRecentNonPendingTx.status !== "reverted" &&
        mostRecentNonPendingTx.gasEstimate
      ) {
        gasEstimate = mostRecentNonPendingTx.gasEstimate;
      }
    }

    const systemArgs = args[0];
    let txOptions = args[1] || {};

    let txHash: Hex | undefined;
    try {
      if (gasEstimate === 0n) {
        if (network.networkConfig.chain.id === 31337) {
          txOptions = {
            ...txOptions,
            maxFeePerGas: 0n,
            maxPriorityFeePerGas: 0n,
          };
        }

        try {
          gasEstimate = await ((contract.estimateGas[systemCall] as any)(systemArgs, txOptions) as Promise<bigint>);
        } catch (e) {
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

      const txPromise = (contract.write[systemCall] as any)(systemArgs, {
        ...txOptions,
        gas: gasEstimate,
      }) as Promise<Hex>;

      const txHash = await txPromise;
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

      await network.waitForTransaction(txHash, (receipt) => {
        updateComponent(components.Transaction, txEntity, {
          completedBlock: receipt.blockNumber,
        });
      });

      updateComponent(components.Transaction, txEntity, {
        status: "completed",
        hash: txHash,
        completedTimestamp: BigInt(Date.now()),
        completedBlock: latestBlock,
      });
    } catch (e) {
      updateComponent(components.Transaction, txEntity, {
        status: "reverted",
        error: (e as Error).toString().replaceAll(",", "").replaceAll("\n", " "),
        completedTimestamp: BigInt(Date.now()),
      });

      if (disableRetry || currentRetryCount + 1 > 1) {
        throw e;
      } else {
        txHash = await executeSystem({
          entity,
          systemCall,
          systemId,
          args,
          options: {
            currentRetryCount: currentRetryCount + 1,
          },
        });
      }
    }

    if (sendAnalytics) {
      sendTxAnalytics(txEntity);
    }

    return txHash;
  };

  const executeSystemWithExternalWallet = async <T extends keyof ContractType["write"]>(
    args: Omit<SystemExecutorArgs<T>, "options">
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
      },
    });
  };

  return {
    executeSystem,
    executeSystemWithExternalWallet,
  };
};
