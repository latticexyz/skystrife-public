import { OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { OrbInput } from "./common";
import { useOrbBalance } from "../hooks/useOrbBalance";

export const MATCH_COST = 100_000_000_000_000_000_000n;

export function MatchCost() {
  const orbBalance = useOrbBalance();

  return (
    <div className="flex flex-row w-full">
      <div className="w-full">
        <OverlineSmall className="text-ss-text-x-light">Your Resources</OverlineSmall>
        <OrbInput amount={orbBalance} />
      </div>

      <div className="w-8" />

      <div className="w-full">
        <OverlineSmall className="text-ss-text-x-light">Match Cost</OverlineSmall>
        <OrbInput amount={MATCH_COST} />
      </div>
    </div>
  );
}
