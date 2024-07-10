import { useEntityQuery } from "@latticexyz/react";
import { useAmalgema } from "../../useAmalgema";
import { Modal } from "./Modal";
import { Has, Not, getComponentValue, Entity } from "@latticexyz/recs";
import { useExternalAccount } from "./hooks/useExternalAccount";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { Hex } from "viem";
import WarningSection from "../ui/Theme/SkyStrife/WarningSection";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { getMatchUrl } from "../../getMatchUrl";
import { DateTime } from "luxon";

export function OngoingMatch() {
  const {
    components: { MatchFinished, MatchRanking, MatchPlayer, MatchPlayers, MatchConfig, MatchName },
  } = useAmalgema();

  const ongoingMatches = useEntityQuery([Has(MatchConfig), Has(MatchName), Has(MatchPlayers), Not(MatchFinished)]);

  const { address } = useExternalAccount();
  if (!address) return;

  const ongoingMatchUserIsIn = ongoingMatches.find((m) => {
    const startTime = getComponentValue(MatchConfig, m)?.startTime ?? 0n;
    if (startTime !== 0n && startTime < BigInt(Math.round(DateTime.now().toSeconds())) - 60n * 30n) return false;

    const matchPlayerEntity = encodeEntity(MatchPlayer.metadata.keySchema, {
      matchEntity: m as Hex,
      playerAddress: address,
    });
    const matchPlayer = getComponentValue(MatchPlayer, matchPlayerEntity)?.playerEntity;
    if (!matchPlayer) return false;

    const matchRanking = getComponentValue(MatchRanking, m)?.value ?? [];

    // allow player to join another match if they've been eliminated
    return !matchRanking.includes(matchPlayer);
  });

  return (
    <Modal
      isOpen={Boolean(ongoingMatchUserIsIn)}
      title="ongoing match"
      footer={
        <a
          href={getMatchUrl(ongoingMatchUserIsIn ?? ("0x0" as Entity))}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button buttonType="primary" className="w-full">
            get back in the fight!
          </Button>
        </a>
      }
    >
      <WarningSection>
        A match you joined is still active. You may join another match when you have won or been eliminated.
      </WarningSection>
    </Modal>
  );
}
