import { isDefined } from "@latticexyz/common/utils";
import { StorageAdapterBlock } from "@latticexyz/store-sync";
import { Observable, mergeMap, filter, firstValueFrom, scan, shareReplay } from "rxjs";
import { Hex, TransactionReceipt, TransactionReceiptNotFoundError, createPublicClient } from "viem";

export function createWaitForTransaction({
  storedBlockLogs$,
  client,
}: {
  client: ReturnType<typeof createPublicClient>;
  storedBlockLogs$: Observable<StorageAdapterBlock>;
}) {
  const recentBlocksWindow = 10;
  const recentBlocks$ = storedBlockLogs$.pipe(
    scan<StorageAdapterBlock, StorageAdapterBlock[]>(
      (recentBlocks, block) => [block, ...recentBlocks].slice(0, recentBlocksWindow),
      [],
    ),
    filter((recentBlocks) => recentBlocks.length > 0),
    shareReplay(1),
  );

  async function waitForTransaction(tx: Hex, onReceipt?: (receipt: TransactionReceipt) => void): Promise<void> {
    const hasTransaction$ = recentBlocks$.pipe(
      mergeMap(async (blocks) => {
        const txs = blocks.flatMap((block) => block.logs.map((log) => log.transactionHash).filter(isDefined));
        if (txs.includes(tx)) return true;

        try {
          const lastBlock = blocks[0];

          const receipt = await client.getTransactionReceipt({ hash: tx });
          if (onReceipt) onReceipt(receipt);
          if (receipt.status === "reverted") {
            throw new Error(`Transaction ${tx} reverted`);
          }

          return lastBlock.blockNumber >= receipt.blockNumber;
        } catch (error) {
          if (error instanceof TransactionReceiptNotFoundError) {
            return false;
          }
          throw error;
        }
      }),
    );

    await firstValueFrom(hasTransaction$.pipe(filter((v) => Boolean(v))));
  }

  return waitForTransaction;
}
