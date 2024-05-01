import { useComponentValue } from "@latticexyz/react";
import { useAmalgema } from "../../useAmalgema";
import { useExternalAccount } from "./hooks/useExternalAccount";
import { addressToEntityID } from "../../mud/setupNetwork";
import { Entity } from "@latticexyz/recs";
import { useCallback, useState } from "react";
import { PromiseButton } from "../ui/hooks/PromiseButton";
import { useNameIsValid } from "./hooks/useNameIsValid";
import DangerSection from "../ui/Theme/SkyStrife/DangerSection";

export function ChooseUsernameForm() {
  const {
    components: { Name },
    externalWorldContract,
    executeSystemWithExternalWallet,
  } = useAmalgema();

  const [interacted, setInteracted] = useState(false);

  const { address } = useExternalAccount();
  const name = useComponentValue(Name, address ? addressToEntityID(address) : ("0" as Entity))?.value;

  const [newName, setNewName] = useState(name ?? "");
  const onSetName = useCallback((n: string) => {
    setNewName(n);
    setInteracted(true);
  }, []);

  const { nameValid, nameValidityMessage } = useNameIsValid(newName);

  if (!externalWorldContract || !address) return;

  return (
    <div>
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
        <label htmlFor="username" className="text-ss-text-x-light uppercase">
          Username
        </label>
        <div className="h-1" />
        <div className="flex gap-x-3 w-full">
          <input
            id="username"
            className="bg-ss-bg-0 rounded border border-ss-stroke w-full px-3 py-2 shadow-ss-small grow"
            placeholder="Enter a username"
            value={newName}
            onChange={(e) => {
              // eslint-disable-next-line no-control-regex
              const ascii = e.target.value.replace(/[^\x00-\x7F]/g, "");
              onSetName(ascii);
            }}
          />
          <PromiseButton
            buttonType="primary"
            disabled={!nameValid}
            promise={async () => {
              await executeSystemWithExternalWallet({
                systemCall: "setName",
                systemId: "Set Name",
                args: [[newName], { account: address }],
              });
              setInteracted(false);
            }}
            className="uppercase grow"
          >
            save
          </PromiseButton>
        </div>
      </form>

      {interacted && !nameValid && <DangerSection>{nameValidityMessage}</DangerSection>}
    </div>
  );
}
