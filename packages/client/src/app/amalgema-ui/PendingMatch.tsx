import { useComponentValue } from "@latticexyz/react";
import { Card } from "../ui/Theme/SkyStrife/Card";
import { Caption, Heading } from "../ui/Theme/SkyStrife/Typography";
import { useAmalgema } from "../../useAmalgema";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { MatchRewardsFooter } from "./MatchRewardsFooter";
import { useState } from "react";
import { Hex } from "viem";
import { CreatedBy } from "./CreatedBy";
import { MatchPlayers } from "./MatchPlayers";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { MatchNumber } from "../ui/MatchNumber";

export function PendingMatch({ matchEntity }: { matchEntity: Entity }) {
  const {
    components: { LevelTemplates, MatchMapCopyProgress, MatchConfig },
    externalWalletClient,
    executeSystemWithExternalWallet,
  } = useAmalgema();

  const { openConnectModal } = useConnectModal();

  const [copyPending, setCopyPending] = useState(false);

  const progress = useComponentValue(MatchMapCopyProgress, matchEntity);
  const matchConfig = useComponentValue(MatchConfig, matchEntity);
  if (!matchConfig) return <></>;

  const { createdBy, levelId } = matchConfig;
  const templateIds = getComponentValue(LevelTemplates, levelId as Entity);

  const fraction =
    progress && templateIds ? Math.round(Number(progress.value * 100n) / Number(templateIds.value.length)) : 0;

  return (
    <Card primary>
      <div className="flex justify-between items-center">
        <div className="flex flex-row items-center">
          <span className="text-lg">🖌</span>
          <div className="w-2" />
          <Heading>Summoning... </Heading>
        </div>
        <span className="text-ss-text-x-light">
          <MatchNumber matchEntity={matchEntity} />
        </span>
      </div>

      <CreatedBy createdBy={createdBy as Hex} />

      <div className="h-3" />

      <MatchPlayers matchEntity={matchEntity} />

      <div className="h-6" />

      {externalWalletClient ? (
        <Button
          buttonType={"secondary"}
          onClick={async () => {
            setCopyPending(true);

            await executeSystemWithExternalWallet({
              systemCall: "copyMap",
              args: [[matchEntity as Hex]],
            });

            setCopyPending(false);
          }}
          className="w-full"
        >
          {copyPending ? "Summoning..." : "assist the summon"}
        </Button>
      ) : (
        <Button buttonType={"secondary"} className="w-full" onClick={openConnectModal}>
          assist the summon
        </Button>
      )}

      <div className="h-3" />

      <div className="relative w-full rounded border border-ss-stroke text-center flex flex-col justify-around py-2 overflow-hidden h-[24px] bg-white">
        <div
          style={{
            width: `${fraction}%`,
            height: "100%",
            margin: "-8px 0",
            zIndex: 0,
          }}
          className="bg-ss-blue absolute"
        />

        <div className=" h-[24px] absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center z-100">
          <span className="text-ss-text-x-light">{fraction}%</span>
        </div>
      </div>

      <div className="h-[10px]"></div>

      <Caption className="text-center">Submitting a few transactions will speed up the process for everyone</Caption>

      <div className="h-[10px]"></div>

      <MatchRewardsFooter matchEntity={matchEntity} />
    </Card>
  );
}
