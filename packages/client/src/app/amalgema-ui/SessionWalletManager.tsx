import { formatEther, parseEther } from "viem";
import { EthInput } from "./SummonIsland/common";
import { LOW_BALANCE_THRESHOLD, RECOMMENDED_BALANCE, useBurnerBalance, useMainWalletBalance } from "./hooks/useBalance";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { Modal } from "./Modal";
import { useAmalgema } from "../../useAmalgema";
import { Body } from "../ui/Theme/SkyStrife/Typography";
import { PromiseButton } from "../ui/hooks/PromiseButton";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import WarningSection from "../ui/Theme/SkyStrife/WarningSection";
import DangerSection from "../ui/Theme/SkyStrife/DangerSection";

function LowBalanceSection() {
  return (
    <DangerSection>
      <div className="text-[#BF1818] font-medium">Session wallet almost empty</div>
      <Body className="text-ss-text-default">You do not have enough ETH to finish playing a match.</Body>
    </DangerSection>
  );
}

export function SessionWalletWarning() {
  return (
    <WarningSection>
      <p>
        The session wallet is a private key stored in your browser&apos;s local storage. It allows you to play games
        without having to confirm transactions, but is less secure
      </p>
      <br />
      <p>
        <strong>Only deposit very small amounts of ETH in this wallet.</strong> We recommend no more than 0.005 ETH at a
        time - an amount that will allow you to play many matches of Sky Strife.
      </p>
    </WarningSection>
  );
}

export function SessionWalletModal({ primary }: { primary?: boolean }) {
  const {
    externalWalletClient,
    network: { walletClient, waitForTransaction },
    utils: { refreshBalance },
  } = useAmalgema();

  const burnerBalance = useBurnerBalance();
  const mainWalletBalance = useMainWalletBalance();

  const [txSuccessful, setTxSuccessful] = useState(false);

  const [transferAmount, setTransferAmount] = useState<number | null>(null);

  return (
    <Modal
      small
      title="transfer to session wallet"
      trigger={
        <Button buttonType={primary ? "primary" : "tertiary"} className="w-full">
          deposit funds
        </Button>
      }
    >
      <SessionWalletWarning />

      <div className="h-8" />

      {txSuccessful && (
        <>
          <div className="border border-[#4FC530] bg-[#E3FFDB] rounded-lg p-2 text-[#4FC530]">
            Session wallet deposit successful.
          </div>
          <div className="h-4" />
        </>
      )}

      <div className="flex flex-row space-x-6">
        <EthInput
          amount={mainWalletBalance.value ? mainWalletBalance.value : 0n}
          className="pr-2"
          label="Main Wallet"
        />
        <EthInput amount={burnerBalance.value ? burnerBalance.value : 0n} className="pr-2" label="Session Wallet" />
      </div>

      {burnerBalance?.danger && (
        <>
          <div className="h-3" />
          <LowBalanceSection />
          <div className="h-4" />

          <PromiseButton
            promise={async () => {
              if (!externalWalletClient || !externalWalletClient.account) {
                throw new Error("No external wallet connected");
              }

              const tx = await externalWalletClient.sendTransaction({
                chain: walletClient.chain,
                account: externalWalletClient.account,
                to: walletClient.account.address,
                value: RECOMMENDED_BALANCE - (burnerBalance?.value ?? 0n),
              });
              await waitForTransaction(tx);
              refreshBalance(walletClient.account.address);
              setTxSuccessful(true);
            }}
            disabled={mainWalletBalance?.belowRecommended}
            className="w-full"
            buttonType="primary"
          >
            {mainWalletBalance?.belowRecommended
              ? "insufficient eth"
              : `top up session wallet to ${formatEther(RECOMMENDED_BALANCE)} ETH`}
          </PromiseButton>

          <div className="h-3" />

          <div className="mx-auto w-fit text-ss-text-x-light">or</div>
        </>
      )}

      <div className="h-3" />

      <div className="flex space-x-3">
        <div className="grow flex items-center space-x-2">
          <input
            className={twMerge("w-full bg-white px-4 py-2 border border-[#DDDAD0] grow")}
            type="number"
            placeholder="Transfer custom amount"
            value={transferAmount ?? ""}
            min={0}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              if (isNaN(n)) {
                setTransferAmount(null);
                return;
              }

              setTransferAmount(n);
            }}
          />
        </div>

        <PromiseButton
          promise={async () => {
            if (!externalWalletClient || !externalWalletClient.account) {
              throw new Error("No external wallet connected");
            }

            const tx = await externalWalletClient.sendTransaction({
              chain: walletClient.chain,
              account: externalWalletClient.account,
              to: walletClient.account.address,
              value: parseEther((transferAmount ?? 0).toString()),
            });

            await waitForTransaction(tx);
            refreshBalance(walletClient.account.address);
            setTxSuccessful(true);
          }}
          buttonType="secondary"
          disabled={
            (transferAmount ?? 0) <= 0 ||
            (mainWalletBalance?.value ?? 0n) < parseEther((transferAmount ?? 0).toString())
          }
        >
          transfer
        </PromiseButton>
      </div>

      <div className="h-8" />
    </Modal>
  );
}

export function SessionWalletManager() {
  const burnerBalance = useBurnerBalance();
  return (
    <div>
      <EthInput
        amount={burnerBalance.value ? burnerBalance.value : 0n}
        className="pr-2"
        label="Session Wallet Balance"
      />

      {burnerBalance?.danger && (
        <>
          <div className="h-2" />
          <LowBalanceSection />
        </>
      )}

      <div className="h-3" />

      <SessionWalletModal />
    </div>
  );
}
