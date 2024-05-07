import { useAccount } from "wagmi";
import { useAmalgema } from "../../useAmalgema";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { Caption } from "../ui/Theme/SkyStrife/Typography";
import { switchChain } from "viem/actions";
import { twMerge } from "tailwind-merge";
import { SyncStatus } from "./SyncStatus";

export function NetworkStatus({ className }: { className?: string }) {
  const {
    network: { networkConfig },
    externalWalletClient,
  } = useAmalgema();

  const clientChain = networkConfig.chain;

  const { chain: walletChain } = useAccount();
  const walletChainId = walletChain?.id ?? 0;

  if (!externalWalletClient) return <></>;

  return (
    <div className="flex gap-x-4">
      <SyncStatus />

      <Button
        buttonType="tertiary"
        onClick={() => {
          switchChain(externalWalletClient, {
            id: clientChain.id,
          });
        }}
        className={twMerge("h-[32px] flex justify-center items-center border-1 rounded-2xl", className)}
      >
        {externalWalletClient ? (
          clientChain.id === walletChainId ? (
            <div className="flex flex-row justify-center items-center">
              <div className="w-3 h-3 bg-green-500 rounded-md m-1" />
              <Caption>{clientChain.name}</Caption>
            </div>
          ) : (
            <div className="flex flex-row justify-center items-center">
              <div className="w-3 h-3 bg-red-500 rounded-md m-1" />
              <Caption>Switch to {networkConfig.chain.name}</Caption>
            </div>
          )
        ) : (
          <></>
        )}
      </Button>
    </div>
  );
}
