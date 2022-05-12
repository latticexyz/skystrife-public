import { Entity, getComponentValue } from "@latticexyz/recs";
import { useAmalgema } from "../../useAmalgema";
import { Card } from "../ui/Theme/SkyStrife/Card";
import { Body, Heading } from "../ui/Theme/SkyStrife/Typography";
import { useComponentValue } from "@latticexyz/react";
import { CreatedBy, DisplayNameUnformatted } from "./CreatedBy";
import { Hex, hexToString } from "viem";
import { MatchNumber } from "../ui/MatchNumber";
import { encodeMatchEntity } from "../../encodeMatchEntity";

export function HistoricalMatch({ matchEntity }: { matchEntity: Entity }) {
  const {
    components: { MatchRanking, OwnedBy, MatchConfig, MatchName },
  } = useAmalgema();

  const matchConfig = getComponentValue(MatchConfig, matchEntity);
  const matchName =
    useComponentValue(MatchName, matchEntity)?.value ?? hexToString((matchConfig?.levelId ?? "0x00") as Hex);

  const matchRanking = getComponentValue(MatchRanking, matchEntity);

  const winner = encodeMatchEntity(matchEntity, matchRanking?.value[0] ?? "");
  const winnerWallet = getComponentValue(OwnedBy, winner)?.value;

  const startTime = matchConfig?.startTime ?? 0n;

  if (!matchEntity) return <></>;

  return (
    <Card primary={false}>
      <div className="flex flex-row justify-between items-center">
        <span className="flex flex-row items-center">
          <div className="text-lg">🏆</div>
          <div className="w-2" />
          <Heading className="normal-case">{matchName}</Heading>
        </span>
        <Body className="text-ss-text-x-light">
          <MatchNumber matchEntity={matchEntity} />
        </Body>
      </div>

      {matchConfig?.createdBy && <CreatedBy createdBy={matchConfig.createdBy as Hex} />}

      <div className="h-4" />
      <Body>Match played at {new Date(Number(startTime * 1000n)).toLocaleString()}</Body>

      <div className="h-4" />
      <Body>{winnerWallet ? <DisplayNameUnformatted entity={winnerWallet as Entity} /> : null} won the match.</Body>

      <div className="h-3"></div>
    </Card>
  );
}
