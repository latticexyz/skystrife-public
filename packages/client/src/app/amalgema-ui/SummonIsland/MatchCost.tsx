import { OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { OrbInput } from "./common";
import { useOrbBalance } from "../hooks/useOrbBalance";
import { parseEther } from "viem";

export function MatchCost({ isPractice }: { isPractice: boolean }) {
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
        <OrbInput amount={isPractice ? parseEther("5") : parseEther("100")} />
      </div>
    </div>
  );
}
