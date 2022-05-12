import { formatEther } from "viem";
import { OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { OrbInput } from "./common";
import { useOrbBalance } from "../hooks/useOrbBalance";

export function MatchCost() {
  const matchCost = 100n;
  const orbBalance = useOrbBalance();

  return (
    <div className="flex flex-row w-full">
      <div className="w-full">
        <OverlineSmall className="text-ss-text-x-light">Your Resources</OverlineSmall>
        <OrbInput amount={BigInt(formatEther(orbBalance ?? "0"))} />
      </div>

      <div className="w-8" />

      <div className="w-full">
        <OverlineSmall className="text-ss-text-x-light">Match Cost</OverlineSmall>
        <OrbInput amount={matchCost} />
      </div>
    </div>
  );
}
