import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Hex, decodeFunctionData } from "viem";
import { ContractWrite } from "@latticexyz/common";
import { usePromise } from "@latticexyz/react";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { PendingIcon } from "../ui/Theme/PendingIcon";
import { useAmalgema } from "../../useAmalgema";
import { ConfirmedIcon } from "../ui/Theme/ConfirmedIcon";
import { CrossIcon } from "../ui/Theme/CrossIcon";
import { getTransactionReceipt } from "./utils/getTransactionReceipt";
import { ExclaimIcon } from "../ui/Theme/ExclaimIcon";
import { Link } from "../ui/Theme/SkyStrife/Typography";

const AUTOMATIC_DISMISS_TIME = 10_000;

type MessageFunction = (arg: { functionName: string; args?: readonly unknown[] }) => string;

const messagePending: MessageFunction = ({ functionName, args }) => {
  if (functionName === "copyMap") {
    return `Summoning Island`;
  } else if (functionName === "createMatch") {
    return `Creating Match`;
  } else if (functionName === "createMatchSeasonPass") {
    return `Creating Match`;
  } else if (functionName === "register") {
    return `Registering`;
  } else if (functionName === "setName") {
    return `Setting Name`;
  } else if (functionName === "setMembers") {
    return `Setting Members`;
  } else if (functionName === "registerDelegation") {
    return `Registering Delegation`;
  } else if (functionName === "buySeasonPass") {
    return `Buying Season Pass`;
  } else if (functionName === "batchCall") {
    if (args) {
      const data = (args[0] as { callData: Hex }[]).map((arg) =>
        messagePending(decodeFunctionData({ abi: IWorldAbi, data: arg.callData })),
      );
      return data.join(", ");
    }

    return functionName;
  }

  return functionName;
};

const messageConfirmed: MessageFunction = ({ functionName, args }) => {
  if (functionName === "copyMap") {
    return `Island Summoned`;
  } else if (functionName === "createMatch") {
    return `Created Match`;
  } else if (functionName === "createMatchSeasonPass") {
    return `Created Match`;
  } else if (functionName === "register") {
    return `Registered`;
  } else if (functionName === "setName") {
    return `Set Name`;
  } else if (functionName === "setMembers") {
    return `Set Members`;
  } else if (functionName === "registerDelegation") {
    return `Registered Delegation`;
  } else if (functionName === "buySeasonPass") {
    return `Bought Season Pass`;
  } else if (functionName === "batchCall") {
    if (args) {
      const data = (args[0] as { callData: Hex }[]).map((arg) =>
        messageConfirmed(decodeFunctionData({ abi: IWorldAbi, data: arg.callData })),
      );
      return data.join(", ");
    }

    return functionName;
  }

  return functionName;
};

const messageFailed: MessageFunction = ({ functionName, args }) => {
  if (functionName === "copyMap") {
    return `Island Summoning Failed`;
  } else if (functionName === "createMatch") {
    return `Creating Match Failed`;
  } else if (functionName === "createMatchSeasonPass") {
    return `Creating Match Failed`;
  } else if (functionName === "register") {
    return `Registering Failed`;
  } else if (functionName === "setName") {
    return `Setting Name Failed`;
  } else if (functionName === "setMembers") {
    return `Setting Members failed`;
  } else if (functionName === "registerDelegation") {
    return `Registering Delegation Failed`;
  } else if (functionName === "buySeasonPass") {
    return `Buying Season Pass Failed`;
  } else if (functionName === "batchCall") {
    if (args) {
      const data = (args[0] as { callData: Hex }[]).map((arg) =>
        messageFailed(decodeFunctionData({ abi: IWorldAbi, data: arg.callData })),
      );
      return data.join(", ");
    }

    return functionName;
  }

  return functionName;
};

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
  write,
  dismissedTransactions,
  setDismissedTransactions,
}: {
  write: ContractWrite;
  dismissedTransactions: Array<string>;
  setDismissedTransactions: Dispatch<SetStateAction<string[]>>;
}) => {
  const {
    network: { publicClient },
  } = useAmalgema();

  const [timeUntilDismiss, setTimeUntilDismiss] = useState(AUTOMATIC_DISMISS_TIME);
  const [startDismiss, setStartDismiss] = useState(false);

  const hash = usePromise(write.result);
  const transactionReceiptPromise = getTransactionReceipt(publicClient, write);
  const transactionReceipt = usePromise(transactionReceiptPromise);

  const blockExplorer = publicClient.chain.blockExplorers?.default.url;

  const isPending = hash.status === "pending" || transactionReceipt.status === "pending";
  const isRevert =
    hash.status === "rejected" ||
    (transactionReceipt.status === "fulfilled" && transactionReceipt.value.status === "reverted");

  let functionName = write.request.functionName;
  let functionArgs = write.request.args;
  if (functionName === "call" || functionName === "callFrom") {
    const functionSelectorAndArgs: Hex = write.request?.args?.length
      ? (write.request.args[write.request.args.length - 1] as Hex)
      : `0x`;
    const functionData = decodeFunctionData({ abi: IWorldAbi, data: functionSelectorAndArgs });
    functionName = functionData.functionName;
    functionArgs = functionData.args;
  }

  useEffect(() => {
    if (!startDismiss) return;

    const interval = setInterval(() => {
      setTimeUntilDismiss((timeUntilDismiss) => timeUntilDismiss - 10);
    }, 10);

    return () => clearInterval(interval);
  }, [startDismiss]);

  useEffect(() => {
    if (timeUntilDismiss <= 0) setDismissedTransactions([...dismissedTransactions, write.id]);
  });

  useEffect(() => {
    if (transactionReceipt.status === "fulfilled") setStartDismiss(true);
  }, [transactionReceipt]);

  return (
    <div>
      {isPending ? (
        <PendingTransaction message={messagePending({ functionName, args: functionArgs })} />
      ) : isRevert ? (
        <FailedTransaction
          startDismiss={startDismiss}
          timeUntilDismiss={timeUntilDismiss}
          onClick={() => setDismissedTransactions([...dismissedTransactions, write.id])}
          message={messageFailed({ functionName, args: functionArgs })}
          hash={hash.status === "fulfilled" ? hash.value : undefined}
          blockExplorer={blockExplorer}
        />
      ) : (
        <ConfirmedTransaction
          startDismiss={startDismiss}
          timeUntilDismiss={timeUntilDismiss}
          onClick={() => setDismissedTransactions([...dismissedTransactions, write.id])}
          message={messageConfirmed({ functionName, args: functionArgs })}
          hash={hash.status === "fulfilled" ? hash.value : undefined}
          blockExplorer={blockExplorer}
        />
      )}
    </div>
  );
};

function DisplayTransactions({ writes }: { writes: ContractWrite[] }) {
  const [dismissedTransactions, setDismissedTransactions] = useState<Array<string>>([]);

  const visibleWrites = writes.filter((value) => !dismissedTransactions.includes(value.id));

  return (
    visibleWrites.length > 0 && (
      <div style={{ zIndex: 1500 }} className="absolute top-[8px] left-1/2 -translate-x-1/2 my-8 w-96">
        {visibleWrites.slice(0, 3).map((write, i) => (
          <div key={write.id} className="flex justify-center w-full">
            <div
              style={{
                top: `${i * 16}px`,
                transition: `top 0.2s ease-in-out`,
              }}
              className="absolute w-80"
            >
              <TransactionSummary
                write={write}
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

export function Transactions() {
  const { writes } = useAmalgema();

  return <DisplayTransactions writes={writes} />;
}
