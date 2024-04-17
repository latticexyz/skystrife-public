import { useMemo, useState } from "react";
import { Card } from "../../ui/Theme/SkyStrife/Card";
import { twMerge } from "tailwind-merge";
import { useSummonIslandModal } from "../SummonIsland";
import { useAmalgema } from "../../../useAmalgema";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Plus } from "../../ui/Theme/SkyStrife/Icons/Plus";
import { Button } from "../../ui/Theme/SkyStrife/Button";
import { OpenMatches } from "./OpenMatches";
import { SpectateMatches } from "./SpectateMatches";
import { HistoricalMatches } from "./HistoricalMatches";
import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue, Not, getComponentValue } from "@latticexyz/recs";

enum Tabs {
  Play = "play",
  Spectate = "spectate",
  Historical = "historical",
}

const BUGGED_MATCHES = [] as Entity[];

export function MatchTable() {
  const {
    components: { MatchConfig, MatchFinished, MatchJoinable, MatchReady, MatchPlayers },
  } = useAmalgema();

  const [currentTab, setCurrentTab] = useState<Tabs>(Tabs.Play);

  const openMatches = useEntityQuery([
    Has(MatchConfig),
    HasValue(MatchJoinable, { value: true }),
    Has(MatchReady),
    Not(MatchFinished),
  ]);
  const pendingMatches = useEntityQuery([
    Has(MatchConfig),
    HasValue(MatchJoinable, { value: true }),
    Not(MatchReady),
    Not(MatchFinished),
  ]);
  const allMatches = openMatches.concat(pendingMatches).filter((match) => !BUGGED_MATCHES.includes(match));

  const joinableMatches = useMemo(() => {
    return allMatches.sort((a, b) => {
      const numPlayersA = getComponentValue(MatchPlayers, a)?.value.length ?? 0;
      const numPlayersB = getComponentValue(MatchPlayers, b)?.value.length ?? 0;

      if (numPlayersA !== numPlayersB) {
        return numPlayersB - numPlayersA;
      }

      const aConfig = getComponentValue(MatchConfig, a);
      const bConfig = getComponentValue(MatchConfig, b);

      // This sort is purely so that Sky Pool created matches are shown on the first page
      // Registration time is currently only in the admin UI so no one else can set it easily
      return Number((bConfig?.registrationTime ?? 0n) - (aConfig?.registrationTime ?? 0n));
    });
  }, [MatchConfig, MatchPlayers, allMatches]);

  const historicalMatches = useEntityQuery([Has(MatchConfig), Has(MatchFinished)]);
  historicalMatches.sort((a, b) => {
    const aTime = getComponentValue(MatchConfig, a)?.startTime ?? 0n;
    const bTime = getComponentValue(MatchConfig, b)?.startTime ?? 0n;
    return Number(bTime - aTime);
  });

  const liveMatches = useEntityQuery([HasValue(MatchJoinable, { value: false }), Has(MatchConfig), Not(MatchFinished)]);
  const oneHour = 60n * 60n;
  const sortedLiveMatches = useMemo(() => {
    return liveMatches
      .filter((matchEntity) => {
        return (
          (getComponentValue(MatchConfig, matchEntity)?.startTime ?? 0n) + oneHour >
          BigInt(Math.floor(Date.now() / 1000))
        );
      })
      .sort((a, b) => {
        const aConfig = getComponentValue(MatchConfig, a);
        const bConfig = getComponentValue(MatchConfig, b);

        return Number((bConfig?.startTime ?? 0n) - (aConfig?.startTime ?? 0n));
      });
  }, [MatchConfig, liveMatches, oneHour]);

  const { externalWalletClient } = useAmalgema();

  const { openConnectModal } = useConnectModal();

  const { setModalOpen, modal: summonIslandModal } = useSummonIslandModal();

  const tabButton = (tab: Tabs, text: string, count: number) => {
    return (
      <button
        onClick={() => setCurrentTab(tab)}
        className={twMerge(
          "text-ss-text-light h-full text-lg w-1/3",
          currentTab === tab ? "bg-ss-gold text-ss-text-default" : "hover:bg-ss-gold hover:text-ss-text-default",
        )}
      >
        {text} <span className="text-ss-text-default">({count ?? "0"})</span>
      </button>
    );
  };

  return (
    <div className="grow flex flex-col p-0">
      <div className="flex w-full">
        <Card primary={false} className="w-1/2 p-0 flex">
          {tabButton(Tabs.Play, "Play", joinableMatches.length)}

          {tabButton(Tabs.Spectate, "Spectate", sortedLiveMatches.length)}

          {tabButton(Tabs.Historical, "History", historicalMatches.length)}
        </Card>

        <div className="grow" />

        <Button
          buttonType="primary"
          size="lg"
          onClick={() => {
            if (!externalWalletClient) {
              if (openConnectModal) openConnectModal();
              return;
            }

            setModalOpen(true);
          }}
        >
          <div className="flex flex-row items-center justify-center h-fit">
            <Plus /> <div className="w-4" /> <span>create match</span>
          </div>
        </Button>

        {summonIslandModal}
      </div>

      <div className="h-6 shrink-0" />

      <Card className="grow flex flex-col w-full p-0">
        {currentTab === Tabs.Play && <OpenMatches matches={joinableMatches} />}
        {currentTab === Tabs.Spectate && <SpectateMatches matches={sortedLiveMatches} />}
        {currentTab === Tabs.Historical && <HistoricalMatches matches={historicalMatches} />}
      </Card>
    </div>
  );
}
