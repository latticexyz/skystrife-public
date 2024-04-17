import { parseEther } from "viem";
import { Modal } from "../../amalgema-ui/Modal";
import { EthInput } from "../../amalgema-ui/SummonIsland/common";
import { useBurnerBalance } from "../../amalgema-ui/hooks/useBalance";
import { useMainWalletBalance } from "../../amalgema-ui/hooks/useBalance";
import { Button } from "../Theme/SkyStrife/Button";
import { Card } from "../Theme/SkyStrife/Card";
import { Body, OverlineLarge } from "../Theme/SkyStrife/Typography";
import { PromiseButton } from "../hooks/PromiseButton";
import { useAmalgema } from "../../../useAmalgema";
import { useExternalInMatch } from "../hooks/useExternalInMatch";
import { Entity } from "@latticexyz/recs";

function TopUpButton() {
  const {
    externalWalletClient,
    network: { walletClient },
  } = useAmalgema();

  return (
    <PromiseButton
      promise={async () => {
        if (!externalWalletClient || !externalWalletClient.account) {
          throw new Error("No external wallet connected");
        }

        await externalWalletClient.sendTransaction({
          chain: walletClient.chain,
          account: externalWalletClient.account,
          to: walletClient.account.address,
          value: parseEther("0.001"),
        });
      }}
      buttonType="primary"
      className="grow w-full"
    >
      send eth to session wallet
    </PromiseButton>
  );
}

export function SessionWallet() {
  const {
    network: { matchEntity },
  } = useAmalgema();

  const burnerBalance = useBurnerBalance();
  const mainWalletBalance = useMainWalletBalance();
  const inMatch = useExternalInMatch(matchEntity || ("0" as Entity));

  return (
    <>
      {!import.meta.env.DEV && inMatch && burnerBalance?.belowMinimum && (
        <Card className="w-fit py-2 px-3 pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-red-600 h-3 w-3 animate-pulse" />

            <div className="w-2" />

            <OverlineLarge
              style={{
                fontWeight: 400,
                fontSize: "14px",
              }}
              className="text-ss-text-light"
            >
              session wallet balance
            </OverlineLarge>

            <div className="w-2" />

            <OverlineLarge
              style={{
                fontWeight: 500,
                fontSize: "14px",
              }}
              className="text-ss-text-default"
            >
              {burnerBalance.formatted} ETH
            </OverlineLarge>
          </div>

          <div className="h-2" />

          <TopUpButton />

          <Modal
            isOpen={burnerBalance.belowDanger}
            title="no more session wallet funds"
            trigger={<></>}
            footer={
              <div className="flex w-full space-x-2">
                <a href="/" className="grow">
                  <Button buttonType="danger" className="w-full">
                    quit match
                  </Button>
                </a>

                <TopUpButton />
              </div>
            }
          >
            <div className="flex flex-row space-x-6">
              <EthInput
                amount={mainWalletBalance.value ? mainWalletBalance.value : 0n}
                className="pr-2"
                label="Main Wallet"
              />
              <EthInput
                amount={burnerBalance.value ? burnerBalance.value : 0n}
                className="pr-2"
                label="Session Wallet"
              />
            </div>

            <div className="h-4" />

            {burnerBalance.belowDanger && (
              <Body>
                You do not have enough ETH in your session wallet to play this match of Sky Strife. If you would like to
                continue playing, you must top up your session wallet or transfer a custom amount.
              </Body>
            )}
          </Modal>
        </Card>
      )}
    </>
  );
}
