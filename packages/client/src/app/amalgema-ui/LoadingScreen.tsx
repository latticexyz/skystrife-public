import React, { useEffect, useMemo, useState } from "react";
import { getComponentValue } from "@latticexyz/recs";
import { concat, map } from "rxjs";
import { useObservableValue } from "../../useObservableValue";
import { filterNullish } from "@latticexyz/utils";
import { NetworkLayer } from "../../layers/Network";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { Body, Caption, Link, OverlineLarge } from "../ui/Theme/SkyStrife/Typography";
import { Card } from "../ui/Theme/SkyStrife/Card";
import { DISCORD_URL, HOW_TO_PLAY_URL, LATTICE_URL, MUD_URL } from "../links";
import { SyncStep } from "@latticexyz/store-sync";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EMOJI } from "../../constants";
import { DateTime } from "luxon";

type Props = {
  networkLayer: NetworkLayer | null;
  usePrepTime?: boolean;
};

export const LoadingScreen = ({ networkLayer, usePrepTime }: Props) => {
  const [hide, setHide] = React.useState(false);

  const [prepareGameProgress, setPrepareGameProgress] = useState(0);
  const [startGameProgress, setStartGameProgress] = useState(false);

  const loadingState = useObservableValue(
    useMemo(() => {
      if (!networkLayer) return;

      const {
        components: { SyncProgress },
        utils: { sendAnalyticsEvent },
      } = networkLayer;

      sendAnalyticsEvent("loading-screen", {
        startTime: Math.floor(DateTime.now().toSeconds()),
      });

      // use LoadingState.update$ as a trigger rather than a value
      // and concat with an initial value to trigger the first look up
      return concat([1], SyncProgress.update$).pipe(
        map(() => {
          const loadingState = getComponentValue(SyncProgress, singletonEntity);
          return loadingState ?? null;
        }),
        filterNullish()
      );
    }, [networkLayer]),
    {
      message: "Connecting",
      percentage: 0,
      step: SyncStep.INITIALIZE,
      lastBlockNumberProcessed: 0n,
      latestBlockNumber: 0n,
    }
  );

  const [sentEndEvent, setSentEndEvent] = React.useState(false);
  useEffect(() => {
    if (sentEndEvent) return;
    if (!networkLayer) return;

    if (loadingState.step === SyncStep.LIVE) {
      const {
        utils: { sendAnalyticsEvent },
      } = networkLayer;

      setSentEndEvent(true);
      sendAnalyticsEvent("loading-screen", {
        endTime: Math.floor(DateTime.now().toSeconds()),
      });
    }
  }, [loadingState, networkLayer, sentEndEvent, usePrepTime]);

  useEffect(() => {
    if (!usePrepTime) return;
    if (!networkLayer) return;
    if (loadingState.step !== SyncStep.LIVE) return;

    setStartGameProgress(true);
  }, [loadingState, networkLayer, prepareGameProgress, usePrepTime]);

  const prepTimeSeconds = import.meta.env.PROD ? 10 : 1;
  useEffect(() => {
    if (!startGameProgress) return;

    const interval = setInterval(() => {
      setPrepareGameProgress((prev) => {
        if (prev === 100) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, (prepTimeSeconds * 1000) / 100);

    return () => clearInterval(interval);
  }, [networkLayer, prepTimeSeconds, startGameProgress, usePrepTime]);

  if (hide) {
    return null;
  }

  const ready = usePrepTime ? prepareGameProgress === 100 : loadingState.step === SyncStep.LIVE;
  const showPrepMessage = loadingState.step === SyncStep.LIVE && usePrepTime;

  const loadingMessage = showPrepMessage ? "Preparing Game" : loadingState.message;
  const loadingPercentage = showPrepMessage ? prepareGameProgress : loadingState.percentage;

  return (
    <div
      style={{
        zIndex: 1000,
        background: "linear-gradient(rgba(24, 23, 16, 0.4), rgba(24, 23, 16, 0.4)), url(assets/ss-splash-1.png)",
        backgroundPosition: "right",
        backgroundSize: "cover",
      }}
      className="fixed items-center justify-center w-screen h-screen bg-black p-12 flex flex-col"
    >
      <Card primary className="flex flex-col w-[540px] p-8 justify-items">
        <OverlineLarge
          style={{
            fontSize: "80px",
            lineHeight: "110%",
            letterSpacing: "-2%",
          }}
          className="normal-case text-center"
        >
          Sky Strife
        </OverlineLarge>
        <div className="h-3" />
        <Body className="text-ss-text-light text-center">
          Sky Strife is a fully onchain RTS. Compete for control of islands, earn {EMOJI}, and summon your own matches.
        </Body>

        {ready ? (
          <div className="flex flex-col mt-8 grow">
            <Body className="text-center text-ss-text-default">Connected!</Body>
            <Button
              buttonType="primary"
              size="lg"
              onClick={() => {
                setHide(true);
              }}
              className="mt-4 w-full"
            >
              Play
            </Button>
            <div className="h-4"></div>
            <a
              className="w-full"
              href="https://latticexyz.notion.site/How-to-play-Sky-Strife-8c9f951c605e487cad9e8158bc641835?pvs=4}"
              target="_blank"
              rel="noreferrer"
            >
              <Button buttonType="tertiary" size="lg" className="w-full">
                How To Play
              </Button>
            </a>
          </div>
        ) : (
          <div className="flex flex-row w-full mt-8 justify-center items-center">
            <img height="64px" width="64px" src="/public/assets/dragoon_attack.gif" />
            <div className="w-4"></div>
            <Body className="text-center text-3xl text-ss-text-default">
              {loadingMessage}
              <div className="text-ss-blue">({loadingPercentage}%)</div>
            </Body>
            <div className="w-4"></div>
            <img height="64px" width="64px" src="/public/assets/dragoon_attack.gif" />
          </div>
        )}
      </Card>

      <div className="stretch"></div>

      <div className="flex justify-between stretch">
        <div className="absolute bottom-6 left-6 flex justify-between">
          <Link className="text-ss-gold" href={LATTICE_URL}>
            lattice.xyz
          </Link>

          <div className="w-6 text-center text-ss-divider-stroke">|</div>

          <Link className="text-ss-gold" href={DISCORD_URL}>
            join discord
          </Link>

          <div className="w-6 text-center text-ss-divider-stroke">|</div>

          <Link className="text-ss-gold" href={HOW_TO_PLAY_URL}>
            getting started
          </Link>
        </div>

        <Caption className="absolute bottom-6 right-6 ml-4 text-neutral-300">
          powered by{" "}
          <Link className="text-ss-gold" href={MUD_URL}>
            MUD
          </Link>
        </Caption>
      </div>
    </div>
  );
};
