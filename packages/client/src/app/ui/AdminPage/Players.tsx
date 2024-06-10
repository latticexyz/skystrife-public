import { useAmalgema } from "../../../useAmalgema";
import { Entity } from "@latticexyz/recs";
import { useComponentValue } from "@latticexyz/react";
import { Hex, formatEther, isAddress } from "viem";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { Input } from "../Theme/SkyStrife/Input";
import { useState } from "react";

export function Players() {
  const {
    components: { Name, Orb_Balances },
  } = useAmalgema();

  const [searchAddress, setSearchAddress] = useState<Hex | null>(null);
  const playerEntity =
    searchAddress && isAddress(searchAddress) ? addressToEntityID(searchAddress as Hex) : ("0x0" as Entity);
  const name = useComponentValue(Name, playerEntity);
  const orbBalance = useComponentValue(Orb_Balances, playerEntity);

  return (
    <div className="w-1/2">
      {!isAddress(searchAddress) && <div className="bg-red-500">Not a valid address</div>}
      <Input value={searchAddress ?? ""} setValue={setSearchAddress} label="Search" />
      {searchAddress && (
        <div className="flex flex-col gap-y-4 p-8">
          {name ? <div>{name.value}</div> : null}
          {orbBalance ? <div>{formatEther(orbBalance.value)}🔮</div> : null}
        </div>
      )}
    </div>
  );
}
