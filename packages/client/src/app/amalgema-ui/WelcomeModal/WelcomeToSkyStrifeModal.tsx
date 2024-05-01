import { useComponentValue } from "@latticexyz/react";
import { useState } from "react";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { useAmalgema } from "../../../useAmalgema";
import { useEffect } from "react";
import { Entity } from "@latticexyz/recs";
import { Button } from "../../ui/Theme/SkyStrife/Button";
import { useExternalAccount } from "../hooks/useExternalAccount";
import { Modal } from "../Modal";
import { useStore } from "../../../useStore";
import { useAccount } from "wagmi";
import { NetworkStatus } from "../NetworkStatus";
import { Link, OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { useBurnerBalance, useMainWalletBalance } from "../hooks/useBalance";
import { EthInput } from "../SummonIsland/common";
import { useNameIsValid } from "../hooks/useNameIsValid";
import { PromiseButton } from "../../ui/hooks/PromiseButton";
import WarningSection from "../../ui/Theme/SkyStrife/WarningSection";
import { SessionWalletModal } from "../SessionWalletManager";
import { ExternalArrow } from "../../ui/Theme/SkyStrife/Icons/ExternalArrow";

export function WelcomeToSkyStrifeModal() {
  const {
    components: { Name },
    externalWalletClient,
    executeSystemWithExternalWallet,
    network: { networkConfig, walletClient },
    utils: { refreshBalance },
  } = useAmalgema();

  const { loadingPageHidden } = useStore();

  const [visible, setVisible] = useState(false);
  const [skip, setSkip] = useState(false);

  const { address } = useExternalAccount();
  const sessionWalletAddress = walletClient.account.address;

  const name = useComponentValue(Name, address ? addressToEntityID(address) : ("0" as Entity))?.value;

  const { chain: walletChain } = useAccount();
  const clientChain = networkConfig.chain;
  const wrongChain = walletChain?.id !== clientChain.id;

  const balanceData = useMainWalletBalance();
  const noBalance = balanceData?.value === 0n;

  const sessionWalletBalanceData = useBurnerBalance();
  const noSessionWalletBalance = sessionWalletBalanceData?.value === 0n;

  const [newName, setNewName] = useState(name ?? "");
  const { nameValid, nameValidityMessage } = useNameIsValid(newName);

  useEffect(() => {
    if (!address) return;

    refreshBalance(address);
    refreshBalance(sessionWalletAddress);

    if (skip || (name && name.length > 0)) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [address, name, skip, refreshBalance, sessionWalletAddress]);

  if (!loadingPageHidden || !address || !externalWalletClient) return <></>;

  let submitButtonLabel = "save and continue";
  if (wrongChain) {
    submitButtonLabel = "wrong network";
  } else if (noBalance) {
    submitButtonLabel = "insufficient eth";
  } else if (!nameValid) {
    submitButtonLabel = nameValidityMessage;
  }

  const disabled = wrongChain || noBalance || !nameValid;
  const showSessionWalletSection = !wrongChain && !noBalance;
  const showNameSection = !noSessionWalletBalance && showSessionWalletSection;

  return (
    <Modal
      isOpen={visible}
      setOpen={(o) => setSkip(!o)}
      title="Welcome to Sky Strife!"
      footer={
        <>
          <PromiseButton
            buttonType="primary"
            disabled={disabled}
            promise={() => {
              return executeSystemWithExternalWallet({
                systemCall: "setName",
                systemId: "Set Name",
                args: [[newName], { account: address }],
              });
            }}
            className="uppercase grow"
          >
            {submitButtonLabel}
          </PromiseButton>
        </>
      }
    >
      <div className="flex flex-col gap-y-4">
        <WarningSection>
          <p className="font-bold">Some wallets do not use the correct gas fees for Redstone.</p>
          <p>
            To avoid excessive gas costs, please follow{" "}
            <Link href="https://latticexyz.notion.site/Redstone-Network-Fee-Config-26802608ef8343ce855a68ca44b9499e">
              this guide
            </Link>{" "}
            to set the proper fees. You can configure it while sending the transaction to set your username.
          </p>
        </WarningSection>

        <div>
          <OverlineSmall>1. network and eth</OverlineSmall>
          <NetworkStatus className="w-full" />
        </div>

        {!wrongChain && (
          <>
            <EthInput
              amount={balanceData.value ? balanceData.value : 0n}
              className="pr-2"
              label={`${clientChain.name} balance`}
              danger={noBalance}
            />
          </>
        )}

        {!wrongChain && noBalance && (
          <>
            <a rel="noreferrer" href={clientChain.bridgeUrl ?? "#"} target="_blank">
              <Button buttonType={"primary"} className="w-full">
                <div className="flex gap-x-3 items-center">
                  <span>bridge to {clientChain.name}</span> <ExternalArrow />
                </div>
              </Button>
            </a>
          </>
        )}

        {showSessionWalletSection && (
          <div className="w-full">
            <OverlineSmall>2. fund session wallet</OverlineSmall>
            <>
              <EthInput
                amount={sessionWalletBalanceData.value ? sessionWalletBalanceData.value : 0n}
                className="pr-2"
                label={`session wallet balance`}
                danger={noSessionWalletBalance}
              />

              {noSessionWalletBalance && (
                <>
                  <div className="h-4" />
                  <SessionWalletModal primary />
                </>
              )}
            </>
          </div>
        )}

        {showNameSection && (
          <div>
            <OverlineSmall>3. set sky strife username</OverlineSmall>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!nameValid) {
                  executeSystemWithExternalWallet({
                    systemCall: "setName",
                    systemId: "Set Name",
                    args: [[newName], { account: address }],
                  });
                }
              }}
              className="flex flex-col items-start"
            >
              <div className="h-1" />
              <input
                id="username"
                className="bg-ss-bg-0 rounded border border-ss-stroke w-full px-3 py-2 shadow-ss-small"
                placeholder="Enter a username"
                value={newName}
                onChange={(e) => {
                  // eslint-disable-next-line no-control-regex
                  const ascii = e.target.value.replace(/[^\x00-\x7F]/g, "");

                  setNewName(ascii);
                }}
              />
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
}
