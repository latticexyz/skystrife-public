import { useComponentValue } from "@latticexyz/react";
import { useState } from "react";
import { addressToEntityID } from "../../mud/setupNetwork";
import { useAmalgema } from "../../useAmalgema";
import { useEffect } from "react";
import { Card } from "../ui/Theme/SkyStrife/Card";
import { Entity } from "@latticexyz/recs";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { useExternalAccount } from "./hooks/useExternalAccount";
import { ChooseUsernameForm } from "./ChooseUsernameForm";

function FullscreenModal({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(24, 23, 16, 0.65)",
        zIndex: 100,
      }}
      className="fixed top-0 left-0 w-screen h-screen flex flex-col justify-around"
    >
      <Card primary className="bg-ss-bg-1 flex flex-col justify-center mx-auto p-8 w-[624px]">
        {children}
      </Card>
    </div>
  );
}

export function ChooseUsernameModal() {
  const {
    components: { Name },
  } = useAmalgema();

  const [visible, setVisible] = useState(false);
  const [skip, setSkip] = useState(false);

  const { address } = useExternalAccount();
  const name = useComponentValue(Name, address ? addressToEntityID(address) : ("0" as Entity))?.value;

  useEffect(() => {
    if (!address) return;

    if (skip || (name && name.length > 0)) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [address, name, skip]);

  return (
    <>
      {visible && (
        <FullscreenModal>
          <ChooseUsernameForm />

          <div className="h-4" />

          <Button
            buttonType="tertiary"
            className="uppercase w-full"
            onClick={() => {
              setSkip(true);
            }}
          >
            Skip
          </Button>
        </FullscreenModal>
      )}
    </>
  );
}
