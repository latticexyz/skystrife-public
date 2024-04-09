import { Entity } from "@latticexyz/recs";
import { ClickWrapper } from "../Theme/ClickWrapper";
import { Button } from "../Theme/SkyStrife/Button";
import { Card } from "../Theme/SkyStrife/Card";
import { OverlineLarge } from "../Theme/SkyStrife/Typography";
import { useMatchInfo } from "../hooks/useMatchInfo";
import { JoinGame } from "./JoinGame";
import { MatchLobby } from "./MatchLobby";
import { useMUD } from "../../../useMUD";
import { useComponentValue } from "@latticexyz/react";

export function PreGame({ matchEntity }: { matchEntity: Entity }) {
  const {
    localLayer: {
      components: { MatchStarted },
    },
  } = useMUD();
  const matchInfo = useMatchInfo(matchEntity);
  const matchStarted = useComponentValue(MatchStarted, matchEntity)?.value;

  if (!matchInfo.matchConfig) {
    return (
      <ClickWrapper className="fixed h-screen w-screen">
        <Card primary className="relative w-[500px] mx-auto top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div>
            <OverlineLarge>Invalid match</OverlineLarge>
            <div className="h-4" />
            <div>This match has either not been created yet or it has been cancelled by the host.</div>
            <div className="h-4" />
            <div>Please return home to continue playing Sky Strife.</div>
            <div className="h-4" />
            <a href="/">
              <Button className="w-full" buttonType="secondary">
                Return home
              </Button>
            </a>
          </div>
        </Card>
      </ClickWrapper>
    );
  }

  if (matchStarted) return <></>;

  return (
    <ClickWrapper className="fixed h-screen w-screen">
      <div style={{ zIndex: -1 }} className="absolute top-0 left-0 w-screen h-screen bg-[#181710]/60 -ml-6 -mt-6" />

      <Card
        primary
        className="relative w-[500px] max-h-screen overflow-y-scroll overflow-x-hidden mx-auto top-1/2 -translate-y-1/2 flex flex-col items-center"
      >
        <JoinGame matchEntity={matchEntity} />

        <div
          style={{
            width: "calc(100% + 48px)",
          }}
          className="h-[2px] w-full bg-ss-stroke"
        />

        <MatchLobby matchEntity={matchEntity} />
      </Card>
    </ClickWrapper>
  );
}
