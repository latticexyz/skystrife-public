import { useChainModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useAmalgema } from "../../useAmalgema";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { Caption } from "../ui/Theme/SkyStrife/Typography";

export function NetworkStatus() {
  const {
    network: { publicClient },
  } = useAmalgema();

  const { chain } = useAccount();
  const { openChainModal } = useChainModal();

  return (
    <>
      <Button
        buttonType="tertiary"
        onClick={openChainModal}
        className="h-[32px] flex justify-center items-center border-1 rounded-2xl ml-8"
      >
        {chain ? (
          chain.id === publicClient.chain.id ? (
            <div className="flex flex-row justify-center items-center">
              <div className="w-3 h-3 bg-green-500 rounded-md m-1" />
              <Caption>{publicClient.chain.name}</Caption>
            </div>
          ) : (
            <div className="flex flex-row justify-center items-center">
              <div className="w-3 h-3 bg-red-500 rounded-md m-1" />
              <Caption>Wrong network</Caption>
            </div>
          )
        ) : (
          <div className="flex flex-row justify-center items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-md m-1" />
            <Caption>Not connected</Caption>
          </div>
        )}
      </Button>
    </>
  );
}
