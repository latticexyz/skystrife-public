import React from "react";
import { Button } from "../Theme/SkyStrife/Button";
import { Hex } from "viem";
import { NetworkLayer } from "../../../layers/Network";

type Props = {
  className?: string;
  buttonType: "primary" | "secondary" | "tertiary";
  size?: "lg" | "md";
  children: React.ReactNode;
  disabled?: boolean;
  sendTx: () => Promise<Hex> | undefined;
  network: NetworkLayer["network"];
};

export function SendTxButton({ size, buttonType, sendTx, disabled, className, children, network }: Props) {
  const { waitForTransaction } = network;

  const [pending, setPending] = React.useState(false);
  const onClick = async () => {
    if (pending) return;

    setPending(true);

    try {
      const tx = await sendTx();
      if (!tx) throw new Error("Error sending transaction");
      await waitForTransaction(tx);
    } catch (e) {
      console.error(e);
    } finally {
      setPending(false);
    }
  };

  return (
    <Button disabled={disabled || pending} buttonType={buttonType} size={size} className={className} onClick={onClick}>
      {pending ? "Pending..." : children}
    </Button>
  );
}
