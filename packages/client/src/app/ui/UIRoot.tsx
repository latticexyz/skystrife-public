import { useMUD } from "../../useMUD";
import { useStore } from "../../useStore";
import { Layer } from "./Layer";
import { Admin } from "./Admin";
import { Factory } from "./Factory";
import { GameOutcome } from "./GameOutcome";
import { Leaderboard } from "./Leaderboard";
import { TurnInfo } from "./TurnInfo";
import { PreGame } from "./PreGame";
import { SyncStatus } from "./SyncStatus";
import { PlayerNameHover } from "./PlayerNameHover";
import { TransactionDebug } from "./TransactionDebug";
import { useComponentValue } from "@latticexyz/react";
import { Entity } from "@latticexyz/recs";
import { useEffect } from "react";
import { Body } from "./Theme/SkyStrife/Typography";
import { TopRight } from "./TopRight";
import { Chat } from "./Chat";
import { SelectedEntity } from "./SelectedEntity";

const MatchPageTitle = ({ matchEntity }: { matchEntity: Entity }) => {
  const {
    networkLayer: {
      components: { MatchIndex },
    },
  } = useMUD();

  const matchIndex = useComponentValue(MatchIndex, matchEntity ?? ("__undefined__" as Entity))?.matchIndex;
  useEffect(() => {
    if (matchIndex == null) return;
    const prevTitle = document.title;
    document.title = `Match #${matchIndex}`;
    return () => {
      document.title = prevTitle;
    };
  }, [matchIndex]);

  return null;
};

export const UIRoot = () => {
  const layers = useStore((state) => {
    return {
      networkLayer: state.networkLayer,
      headlessLayer: state.headlessLayer,
      localLayer: state.localLayer,
      phaserLayer: state.phaserLayer,
    };
  });

  if (!layers.networkLayer || !layers.headlessLayer || !layers.localLayer || !layers.phaserLayer) return <></>;

  const { matchEntity } = layers.networkLayer.network;

  return (
    <div>
      <Layer style={{ inset: "24px", overflow: "hidden" }}>
        {matchEntity ? (
          <div>
            <MatchPageTitle matchEntity={matchEntity} />
            <Leaderboard matchEntity={matchEntity} />
            <GameOutcome matchEntity={matchEntity} />
            <Factory matchEntity={matchEntity} />

            <PreGame matchEntity={matchEntity} />

            <TurnInfo matchEntity={matchEntity} />

            <TopRight />

            {!import.meta.env.DEV && <Chat />}

            <SelectedEntity />

            <PlayerNameHover />
          </div>
        ) : (
          <Body className={`fixed text-black bg-ss-bg-0 rounded-lg p-4 w-96 h-96`}>
            <div>You have not set the match ID URL param!</div>
          </Body>
        )}
        <SyncStatus />

        <TransactionDebug />
        <Admin />
      </Layer>
    </div>
  );
};
