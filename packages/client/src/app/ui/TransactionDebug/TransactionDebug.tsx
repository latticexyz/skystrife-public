import { useEffect, useMemo, useState } from "react";
import { useMUD } from "../../../useMUD";
import { useEntityQuery } from "@latticexyz/react";
import { ComponentValue, Has, SchemaOf, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { bigIntMax } from "@latticexyz/common/utils";
import { Heading } from "../Theme/SkyStrife/Typography";
import CsvDownloader from "react-csv-downloader";
import { ClickWrapper } from "../Theme/ClickWrapper";

export function TransactionDebug() {
  const {
    networkLayer: {
      components: { Transaction },
      network: { matchEntity, playerEntity },
    },
  } = useMUD();

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "T") {
        setIsOpen((v) => !v);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const allTransactions = useEntityQuery([Has(Transaction)]);
  const transactionsGroupedBySystemId = useMemo(() => {
    return allTransactions.reduce((acc, entity) => {
      const transaction = getComponentValue(Transaction, entity);
      if (!transaction) return acc;

      const systemId = transaction.systemId;
      if (!acc[systemId]) {
        acc[systemId] = [];
      }
      acc[systemId].push(transaction);
      return acc;
    }, {} as Record<string, ComponentValue<SchemaOf<typeof Transaction>>[]>);
  }, [Transaction, allTransactions]);

  const transactionDebugInfo = Object.entries(transactionsGroupedBySystemId).map(([systemId, transactions]) => {
    const maxGasEstimate = bigIntMax(...transactions.map((t) => t.gasEstimate ?? 0n));
    const numSuccesses = transactions.filter((t) => t.status === "completed").length;
    const numFailures = transactions.filter((t) => t.status === "reverted").length;

    return (
      <div key={systemId} className="mt-4">
        <div>System ID: {systemId}</div>
        <div>Max Gas Estimate: {maxGasEstimate.toLocaleString()}</div>
        <div>Success Rate: {(numSuccesses / (numSuccesses + numFailures)).toFixed(2)}</div>
      </div>
    );
  });

  const meanResponseTime =
    allTransactions.reduce((acc, entity) => {
      const transaction = getComponentValue(Transaction, entity);
      if (!transaction || transaction.status !== "completed") return acc;

      const responseTime = (transaction.completedTimestamp ?? 0n) - (transaction.submittedTimestamp ?? 0n);
      return acc + responseTime;
    }, 0n) /
    (BigInt(allTransactions.filter((t) => getComponentValue(Transaction, t)?.status === "completed").length) || 1n);

  return (
    <>
      {isOpen && (
        <ClickWrapper className="fixed right-0 top-0 z-100 h-screen w-1/3 text-white bg-[#1b1c20]">
          <div className="h-2/3">
            <div className="p-4 overflow-y-scroll">
              <Heading className="text-white">Transaction Debug</Heading>

              {transactionDebugInfo}

              {allTransactions.length > 0 && (
                <div className="mt-4">
                  <div>Mean Response Time: {meanResponseTime.toLocaleString()}</div>
                </div>
              )}
            </div>

            <div className="p-4">
              <CsvDownloader
                datas={() => {
                  const txData = allTransactions.map((e) => getComponentValueStrict(Transaction, e));
                  return txData.map((t) => ({
                    systemCall: t.systemCall,
                    gasEstimate: t.gasEstimate?.toString(),
                    manualGasEstimate: t.manualGasEstimate.toString(),
                    status: t.status,
                    error: t.error,
                    hash: t.hash,
                    responseTime: ((t.completedTimestamp ?? 0n) - (t.submittedTimestamp ?? 0n)).toString(),
                    submittedBlock: t.submittedBlock?.toString(),
                    completedBlock: t.completedBlock?.toString(),
                    completedTimestamp: t.completedTimestamp?.toString(),
                  }));
                }}
                filename={`${playerEntity.slice(
                  playerEntity.length - 9,
                  playerEntity.length - 1
                )}-match-${matchEntity}-transaction-debug`}
              >
                <button className="text-white border border-white rounded p-2">Download Transactions</button>
              </CsvDownloader>
            </div>
          </div>
        </ClickWrapper>
      )}
    </>
  );
}
