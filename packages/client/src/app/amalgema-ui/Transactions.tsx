import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Hex } from "viem";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { PendingIcon } from "../ui/Theme/PendingIcon";
import { useAmalgema } from "../../useAmalgema";
import { ConfirmedIcon } from "../ui/Theme/ConfirmedIcon";
import { CrossIcon } from "../ui/Theme/CrossIcon";
import { ExclaimIcon } from "../ui/Theme/ExclaimIcon";
import { Link } from "../ui/Theme/SkyStrife/Typography";
import { Entity, Has } from "@latticexyz/recs";

const AUTOMATIC_DISMISS_TIME = 10_000;

type Props = {
  startDismiss: boolean;
  timeUntilDismiss: number;
  onClick: () => void;
  message: string;
  hash?: Hex;
  blockExplorer?: string;
};

const ConfirmedTransaction = ({ startDismiss, timeUntilDismiss, onClick, message, hash, blockExplorer }: Props) => {
  return (
    <div
      style={{
        border: "1px solid #4FC530",
        boxShadow: "2px 2px 0px 0px rgba(24, 23, 16, 0.90)",
      }}
      className="bg-[#E3FFDB] rounded-lg overflow-hidden"
    >
      {startDismiss && (
        <div
          className="bg-[#4FC530] h-1 rounded-lg"
          style={{
            width: `${(timeUntilDismiss / AUTOMATIC_DISMISS_TIME) * 100}%`,
          }}
        />
      )}
      <div className="flex px-4 py-3">
        <ConfirmedIcon />
        <div className="ml-2 grow">
          <div className="text-[#2E2D27]">{message}</div>
          {blockExplorer && (
            <Link className="text-ss-text-light hover:text-[#2E2D27] underline" href={`${blockExplorer}/tx/${hash}`}>
              View on block explorer
            </Link>
          )}
        </div>
        <div onClick={onClick}>
          <CrossIcon />
        </div>
      </div>
    </div>
  );
};

const FailedTransaction = ({ startDismiss, timeUntilDismiss, onClick, message, hash, blockExplorer }: Props) => {
  return (
    <div
      style={{
        border: "1px solid #D62F15",
        boxShadow: "2px 2px 0px 0px rgba(24, 23, 16, 0.90)",
      }}
      className="bg-[#FFDCD6] rounded-lg overflow-hidden"
    >
      {startDismiss && (
        <div
          className="bg-[#FF8888] h-1 rounded-lg"
          style={{
            width: `${(timeUntilDismiss / AUTOMATIC_DISMISS_TIME) * 100}%`,
          }}
        />
      )}
      <div className="flex px-4 py-3">
        <ExclaimIcon />
        <div className="ml-2 grow">
          <div className="text-[#2E2D27]">{message}</div>
          {blockExplorer && hash && (
            <Link className="text-ss-text-light hover:text-[#2E2D27] underline" href={`${blockExplorer}/tx/${hash}`}>
              View on block explorer
            </Link>
          )}
        </div>
        <div onClick={onClick}>
          <CrossIcon />
        </div>
      </div>
    </div>
  );
};

const PendingTransaction = ({ message }: { message: string }) => {
  return (
    <div
      style={{
        border: "1px solid #EBA433",
        boxShadow: "2px 2px 0px 0px rgba(24, 23, 16, 0.90)",
      }}
      className="bg-[#FFE8C2] rounded-lg"
    >
      {/* spacer that mimics the dismissal bar */}
      <div className="h-[4px]" />
      <div className="flex px-4 py-3 items-center">
        <div className="w-1" />
        <PendingIcon />
        <div className="w-1" />
        <div className="ml-2 grow">
          <div>{message}</div>
        </div>
      </div>
    </div>
  );
};

// Inspired by MUD dev tools
const TransactionSummary = ({
  txEntity,
  dismissedTransactions,
  setDismissedTransactions,
}: {
  txEntity: Entity;
  dismissedTransactions: Array<Entity>;
  setDismissedTransactions: Dispatch<SetStateAction<Entity[]>>;
}) => {
  const {
    components: { Transaction },
    network: { publicClient },
  } = useAmalgema();

  const txData = useComponentValue(Transaction, txEntity);

  const [timeUntilDismiss, setTimeUntilDismiss] = useState(AUTOMATIC_DISMISS_TIME);
  const [startDismiss, setStartDismiss] = useState(false);

  const hash = txData?.hash as Hex | undefined;
  const blockExplorer = publicClient.chain.blockExplorers?.default.url;

  const isPending = ["pending", "submitted"].includes(txData?.status ?? "");
  const isRevert = txData?.status === "reverted";

  const name = txData?.systemId ?? txData?.systemCall ?? "Unknown";

  useEffect(() => {
    if (!startDismiss) return;

    const interval = setInterval(() => {
      setTimeUntilDismiss((timeUntilDismiss) => timeUntilDismiss - 10);
    }, 10);

    return () => clearInterval(interval);
  }, [startDismiss]);

  useEffect(() => {
    if (timeUntilDismiss <= 0) setDismissedTransactions([...dismissedTransactions, txEntity]);
  });

  useEffect(() => {
    if (txData?.status === "completed") setStartDismiss(true);
  }, [txData]);

  return (
    <div>
      {isPending ? (
        <PendingTransaction message={name ?? ""} />
      ) : isRevert ? (
        <FailedTransaction
          startDismiss={startDismiss}
          timeUntilDismiss={timeUntilDismiss}
          onClick={() => setDismissedTransactions([...dismissedTransactions, txEntity])}
          message={name}
          hash={hash}
          blockExplorer={blockExplorer}
        />
      ) : (
        <ConfirmedTransaction
          startDismiss={startDismiss}
          timeUntilDismiss={timeUntilDismiss}
          onClick={() => setDismissedTransactions([...dismissedTransactions, txEntity])}
          message={name ?? ""}
          hash={hash}
          blockExplorer={blockExplorer}
        />
      )}
    </div>
  );
};

export function Transactions() {
  const {
    components: { Transaction },
  } = useAmalgema();

  const allTransactions = useEntityQuery([Has(Transaction)]);

  const [dismissedTransactions, setDismissedTransactions] = useState<Entity[]>([]);
  const visibleTransactions = allTransactions.filter((t) => !dismissedTransactions.includes(t));

  return (
    visibleTransactions.length > 0 && (
      <div style={{ zIndex: 1500 }} className="absolute top-[8px] left-1/2 -translate-x-1/2 my-8 w-96">
        {visibleTransactions.slice(0, 3).map((txEntity, i) => (
          <div key={txEntity} className="flex justify-center w-full">
            <div
              style={{
                top: `${i * 16}px`,
                transition: `top 0.2s ease-in-out`,
              }}
              className="absolute w-80"
            >
              <TransactionSummary
                txEntity={txEntity}
                dismissedTransactions={dismissedTransactions}
                setDismissedTransactions={setDismissedTransactions}
              />
            </div>
          </div>
        ))}
      </div>
    )
  );
}
