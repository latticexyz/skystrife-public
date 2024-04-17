import { useAmalgema } from "../../useAmalgema";
import { useRef, useState } from "react";
import { Card } from "../ui/Theme/SkyStrife/Card";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { Hex, formatEther } from "viem";
import { OverlineLarge, OverlineSmall, Link, Heading, Caption } from "../ui/Theme/SkyStrife/Typography";
import { useComponentValue } from "@latticexyz/react";
import { addressToEntityID } from "../../mud/setupNetwork";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import useOnClickOutside from "../ui/hooks/useOnClickOutside";
import { useDrip } from "./hooks/useDrip";
import { useExternalAccount } from "./hooks/useExternalAccount";
import { ChooseUsernameForm } from "./ChooseUsernameForm";
import { useMainWalletBalance } from "./hooks/useBalance";

export const formatAddress = (address: Hex) => address.slice(0, 6) + "..." + address.slice(-4);

const SettingsModal = ({ address, close }: { address: Hex; close: () => void }) => {
  const { network } = useAmalgema();
  const { publicClient } = network;

  const blockExplorer = publicClient.chain.blockExplorers?.default.url;

  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, close);

  return (
    <div
      style={{
        background: "rgba(24, 23, 16, 0.65)",
        zIndex: 100,
      }}
      className="fixed top-0 left-0 w-screen h-screen flex flex-col justify-around"
    >
      <div ref={ref} className="mx-auto">
        <Card primary className="bg-ss-bg-1 flex flex-col justify-center p-8 w-[624px]">
          <div className="flex justify-between items-center">
            <OverlineLarge>Account</OverlineLarge>

            <Button buttonType="tertiary" onClick={close} className="h-fit py-1">
              Close
            </Button>
          </div>

          <div className="h-8"></div>

          <div>
            <OverlineSmall>Connection</OverlineSmall>

            <ConnectButton />

            <div className="h-3" />

            <OverlineSmall>Wallet address</OverlineSmall>

            {blockExplorer ? (
              <Link
                href={`${blockExplorer}/address/${address}
            `}
              >
                {address}
              </Link>
            ) : (
              <span>{address}</span>
            )}
          </div>

          <div className="h-6"></div>

          <ChooseUsernameForm />
        </Card>
      </div>
    </div>
  );
};

function Profile({ address }: { address: Hex }) {
  const {
    network: {
      components: { Name },
    },
  } = useAmalgema();

  const [visible, setVisible] = useState(false);

  const name = useComponentValue(Name, addressToEntityID(address));

  const balance = useMainWalletBalance();

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <Heading className="text-lg">{name ? name.value : formatAddress(address)}</Heading>
          <Caption className="text-sm text-ss-text-x-light">
            Balance: {balance.value ? parseFloat(formatEther(balance.value)).toFixed(6) : 0} ETH
          </Caption>
        </div>

        <Button buttonType="tertiary" onClick={() => setVisible(true)} className="h-fit">
          Settings
        </Button>
        {visible && <SettingsModal address={address} close={() => setVisible(false)} />}
      </div>
    </div>
  );
}

function SkyStrifeConnectButton() {
  const { openConnectModal } = useConnectModal();

  return (
    <Button buttonType="secondary" className="h-fit w-full" onClick={openConnectModal}>
      connect wallet
    </Button>
  );
}

export function CurrentProfile() {
  const { address: externalAddress } = useExternalAccount();

  useDrip();

  return externalAddress ? <Profile address={externalAddress} /> : <SkyStrifeConnectButton />;
}
