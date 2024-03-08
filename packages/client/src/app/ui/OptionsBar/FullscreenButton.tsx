import { useCallback, useEffect, useState } from "react";
import { ClickWrapper } from "../Theme/ClickWrapper";
import { Card } from "../Theme/SkyStrife/Card";
import { Body, Heading } from "../Theme/SkyStrife/Typography";
import { Button } from "../Theme/SkyStrife/Button";
import { useMUD } from "../../../useMUD";

export const FullscreenButton = () => {
  const {
    phaserLayer: {
      api: {
        mapInteraction: { mapInteractionEnabled },
      },
    },
  } = useMUD();

  const [fullscreen, setFullscreen] = useState(false);
  const [modalOpen, setModalOpen] = useState(true);
  const [showFullscreenInfo, setShowFullscreenInfo] = useState(false);

  const toggleFullscreen = useCallback(
    (force?: boolean) => {
      if (!force && !mapInteractionEnabled()) return;

      if (fullscreen) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen({ navigationUI: "hide" });
      }
    },
    [fullscreen, mapInteractionEnabled]
  );

  useEffect(() => {
    const changeHandler = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", changeHandler);

    return () => {
      document.removeEventListener("fullscreenchange", changeHandler);
    };
  }, []);

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === " ") {
        toggleFullscreen();
      }
    };

    document.addEventListener("keydown", keyHandler);

    return () => {
      document.removeEventListener("keydown", keyHandler);
    };
  }, [toggleFullscreen]);

  useEffect(() => {
    if (fullscreen) {
      setModalOpen(false);
      setShowFullscreenInfo(true);

      const timeout = setTimeout(() => {
        setShowFullscreenInfo(false);
      }, 10_000);

      return () => {
        clearTimeout(timeout);
        setShowFullscreenInfo(false);
      };
    } else {
      return () => {
        setShowFullscreenInfo(false);
      };
    }
  }, [fullscreen]);

  const contractSvg = ({ strokeColor }: { strokeColor: string }) => (
    <svg className="mx-auto" width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 6V1.5M6 6H1.5M6 6L0.75 0.75M6 12V16.5M6 12H1.5M6 12L0.75 17.25M12 6H16.5M12 6V1.5M12 6L17.25 0.75M12 12H16.5M12 12V16.5M12 12L17.25 17.25"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const expandSvg = ({ strokeColor }: { strokeColor: string }) => (
    <svg className="mx-auto" width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.75 0.75V5.25M0.75 0.75H5.25M0.75 0.75L6 6M0.75 17.25V12.75M0.75 17.25H5.25M0.75 17.25L6 12M17.25 0.75H12.75M17.25 0.75V5.25M17.25 0.75L12 6M17.25 17.25H12.75M17.25 17.25V12.75M17.25 17.25L12 12"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <>
      {modalOpen && (
        <ClickWrapper
          style={{ zIndex: 1100 }}
          className="fixed w-screen h-screen top-0 left-0 bg-black/50 flex flex-col items-center justify-around"
        >
          <Card className="mx-auto w-[480px] flex flex-col items-center justify-center">
            <Heading className="uppercase text-left w-full">fullscreen mode</Heading>

            <Body>Sky Strife is best played in fullscreen. Press Spacebar to toggle fullscreen mode.</Body>

            <div className="h-6" />

            <div className="w-full flex justify-around">
              <Button buttonType="tertiary" onClick={() => setModalOpen(false)}>
                skip
              </Button>

              <div className="w-4" />

              <Button
                buttonType="primary"
                onClick={() => {
                  document.documentElement.requestFullscreen({ navigationUI: "hide" });
                }}
                className="uppercase grow"
              >
                <div className="flex flex-row">
                  {expandSvg({ strokeColor: "black" })} <div className="w-4" />{" "}
                  <span> Enter Fullscreen (spacebar)</span>
                </div>
              </Button>
            </div>
          </Card>
        </ClickWrapper>
      )}

      {showFullscreenInfo && (
        <div className="fixed w-screen h-screen top-0 left-0 flex flex-col items-center">
          <div className="grow" />

          <div className="rounded-lg bg-black/60 text-white/70 p-3">
            Use <span className="font-bold text-white">CTRL + ENTER</span> or{" "}
            <span className="font-bold text-white">SPACEBAR</span> to toggle fullscreen.
          </div>

          <div className="h-4" />
        </div>
      )}

      <ClickWrapper onClick={() => toggleFullscreen(true)}>
        <Card primary className="w-[40px] h-[40px] p-0 flex flex-row items-center">
          {fullscreen
            ? contractSvg({
                strokeColor: "#5D5D4C",
              })
            : expandSvg({ strokeColor: "#5D5D4C" })}
        </Card>
      </ClickWrapper>
    </>
  );
};
