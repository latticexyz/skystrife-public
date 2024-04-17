import { useComponentValue } from "@latticexyz/react";
import { useAmalgema } from "../../useAmalgema";
import { useExternalAccount } from "./hooks/useExternalAccount";
import { addressToEntityID } from "../../mud/setupNetwork";
import { Entity } from "@latticexyz/recs";
import { useState } from "react";
import { Body, Heading } from "../ui/Theme/SkyStrife/Typography";
import { NetworkStatus } from "./NetworkStatus";
import { PromiseButton } from "../ui/hooks/PromiseButton";
import { useNameIsValid } from "./hooks/useNameIsValid";

export function ChooseUsernameForm() {
  const {
    components: { Name },
    externalWorldContract,
    executeSystemWithExternalWallet,
  } = useAmalgema();

  const { address } = useExternalAccount();
  const name = useComponentValue(Name, address ? addressToEntityID(address) : ("0" as Entity))?.value;

  const [newName, setNewName] = useState(name ?? "");
  const { nameValid, nameValidityMessage } = useNameIsValid(newName);

  if (!externalWorldContract || !address) return;

  return (
    <div>
      <div className="flex justify-between items-center">
        <Heading className="uppercase">choose a name</Heading>
        <NetworkStatus />
      </div>
      <Body>Set a name to be associated with your wallet address.</Body>

      <div className="h-8" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!nameValid) {
            executeSystemWithExternalWallet({
              systemCall: "setName",
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

      <div className="flex">
        <PromiseButton
          buttonType="primary"
          disabled={!nameValid}
          promise={() => {
            return executeSystemWithExternalWallet({
              systemCall: "setName",
              args: [[newName], { account: address }],
            });
          }}
          className="uppercase grow"
        >
          {nameValidityMessage || "Save and Continue"}
        </PromiseButton>
      </div>
    </div>
  );
}
