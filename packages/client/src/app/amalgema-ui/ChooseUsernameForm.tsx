import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useAmalgema } from "../../useAmalgema";
import { useExternalAccount } from "./hooks/useExternalAccount";
import { addressToEntityID } from "../../mud/setupNetwork";
import { Entity, Has, getComponentValue } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { Body, Heading } from "../ui/Theme/SkyStrife/Typography";
import { NetworkStatus } from "./NetworkStatus";
import { AnalyticsConsentForm } from "../AnalyticsConsentForm";
import { PromiseButton } from "../ui/hooks/PromiseButton";

export function ChooseUsernameForm() {
  const {
    components: { Name },
    externalWorldContract,
    executeSystemWithExternalWallet,
  } = useAmalgema();

  const { address } = useExternalAccount();
  const name = useComponentValue(Name, address ? addressToEntityID(address) : ("0" as Entity))?.value;
  const allNames = useEntityQuery([Has(Name)]).map((e) => getComponentValue(Name, e)?.value);

  const [newName, setNewName] = useState(name ?? "");

  const nameTaken = allNames.includes(newName);

  useEffect(() => {
    if (newName.length > 32) setNewName(newName.slice(0, 32));
  }, [newName]);

  if (!externalWorldContract || !address) return;

  let disabledMessage = "";
  if (nameTaken) {
    disabledMessage = "Name taken";
  } else if (newName.length === 0) {
    disabledMessage = "Save and Continue";
  }

  const disabled = nameTaken || newName.length === 0;

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
          if (!disabled) {
            executeSystemWithExternalWallet({
              systemCall: "setName",
              args: [[newName]],
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
          onChange={(e) => setNewName(e.target.value)}
        />
      </form>

      <AnalyticsConsentForm />
      <div className="h-6" />

      <div className="flex">
        <PromiseButton
          buttonType="primary"
          disabled={disabled}
          promise={() => {
            return executeSystemWithExternalWallet({
              systemCall: "setName",
              args: [[newName]],
            });
          }}
          className="uppercase grow"
        >
          {disabledMessage || "Save and Continue"}
        </PromiseButton>
      </div>
    </div>
  );
}
