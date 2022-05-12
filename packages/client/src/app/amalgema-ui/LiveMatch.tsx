import { Entity, Has, HasValue, getComponentValue } from "@latticexyz/recs";
import { useAmalgema } from "../../useAmalgema";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { Card } from "../ui/Theme/SkyStrife/Card";
import { Body, Heading } from "../ui/Theme/SkyStrife/Typography";
import { useEntityQuery } from "@latticexyz/react";
import { CreatedBy } from "./CreatedBy";
import { Hex } from "viem";
import { MatchPlayers } from "./MatchPlayers";
import { addressToEntityID } from "../../mud/setupNetwork";
import { getMatchUrl } from "../../getMatchUrl";
import { MatchNumber } from "../ui/MatchNumber";
import { useExternalAccount } from "./hooks/useExternalAccount";
import { useMatchInfo } from "../ui/hooks/useMatchInfo";

export function LiveMatch({ matchEntity }: { matchEntity: Entity }) {
  const {
    components: { Match, Player, OwnedBy },
  } = useAmalgema();

  const { address } = useExternalAccount();
  const matchInfo = useMatchInfo(matchEntity);
  const matchConfig = matchInfo?.matchConfig;

  const allPlayersInMatch = useEntityQuery([Has(Player), HasValue(Match, { matchEntity })]);

  const currentPlayerInMatch = Boolean(
    allPlayersInMatch.find((p) => {
      if (!address) return false;

      const ownedBy = getComponentValue(OwnedBy, p)?.value as Hex;
      return ownedBy === addressToEntityID(address);
    })
  );

  return (
    <Card primary={false}>
      <div className="flex flex-row justify-between items-center">
        <Heading className="normal-case">{matchInfo.matchName}</Heading>
        <Body className="text-ss-text-x-light">
          <MatchNumber matchEntity={matchEntity} />
        </Body>
      </div>

      {matchConfig?.createdBy && <CreatedBy createdBy={matchConfig.createdBy as Hex} />}

      <div className="h-3"></div>

      <MatchPlayers matchEntity={matchEntity} />

      <div className="mb-4"></div>

      {!currentPlayerInMatch && (
        <a href={getMatchUrl(matchEntity)} target="_blank" rel="noopener noreferrer">
          <Button buttonType={"tertiary"} className="w-full">
            Spectate
          </Button>
        </a>
      )}

      {currentPlayerInMatch && (
        <a href={getMatchUrl(matchEntity)} target="_blank" rel="noopener noreferrer">
          <Button buttonType={"tertiary"} className="w-full">
            Play
          </Button>
        </a>
      )}
    </Card>
  );
}
