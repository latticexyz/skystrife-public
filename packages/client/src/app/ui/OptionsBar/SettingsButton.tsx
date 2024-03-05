import { useComponentValue } from "@latticexyz/react";
import { ComponentValue, SchemaOf, setComponent } from "@latticexyz/recs";
import { useEffect, useRef, useState } from "react";
import { useMUD } from "../../../useMUD";
import { ClickWrapper } from "../Theme/ClickWrapper";
import { Card } from "../Theme/SkyStrife/Card";
import { Button } from "../Theme/SkyStrife/Button";
import useLocalStorageState from "use-local-storage-state";
import * as recs from "@latticexyz/recs";
import useOnClickOutside from "../hooks/useOnClickOutside";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export const SettingsButton = () => {
  const {
    localLayer: {
      components: { Preferences },
      api: { persistPreferences },
    },
  } = useMUD();

  const [menuVisible, setMenuVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentPrefs = useComponentValue(Preferences, singletonEntity);

  useOnClickOutside(ref, () => setMenuVisible(false));

  useEffect(() => {
    if (currentPrefs) return;

    const existingPreferences = localStorage.getItem("preferences");
    if (existingPreferences) {
      setComponent(
        Preferences,
        singletonEntity,
        JSON.parse(existingPreferences) as ComponentValue<SchemaOf<typeof Preferences>>
      );
    } else {
      setComponent(Preferences, singletonEntity, {
        hideTutorial: false,
        muteMusic: false,
        showPreferences: false,
        musicVolume: 50,
        disableClouds: false,
        disableBackground: false,
      });
    }
  }, [Preferences, currentPrefs]);

  if (!currentPrefs) return <></>;

  return (
    <div>
      {menuVisible && (
        <ClickWrapper className="fixed top-0 left-0 flex h-screen w-screen flex-col items-center justify-around bg-black bg-opacity-50">
          <div ref={ref}>
            <Card primary className="flex flex-col justify-center items-left w-[400px]">
              <div className="my-3 text-4xl">Sound</div>

              <label className="flex flex-row items-center">
                <h2>Mute Music</h2>
                <input
                  className="ml-2"
                  type="checkbox"
                  checked={currentPrefs.muteMusic}
                  onChange={(e) => {
                    persistPreferences({ ...currentPrefs, muteMusic: e.target.checked });
                  }}
                />
              </label>

              <label>
                <h2>Music Volume</h2>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentPrefs.musicVolume}
                  onChange={(e) => persistPreferences({ ...currentPrefs, musicVolume: parseInt(e.target.value) })}
                />
              </label>

              <div className="my-3 text-4xl">Graphics</div>

              <label className="flex flex-row items-center">
                <h2>Disable Clouds</h2>
                <input
                  className="ml-2"
                  type="checkbox"
                  checked={currentPrefs.disableClouds}
                  onChange={(e) => persistPreferences({ ...currentPrefs, disableClouds: e.target.checked })}
                />
              </label>

              <label className="flex flex-row items-center">
                <h2>Disable Background</h2>
                <input
                  className="ml-2"
                  type="checkbox"
                  checked={currentPrefs.disableBackground}
                  onChange={(e) => persistPreferences({ ...currentPrefs, disableBackground: e.target.checked })}
                />
              </label>

              <Button
                buttonType="secondary"
                className="mt-6 w-full h-fit"
                onClick={() => {
                  setMenuVisible(false);
                }}
              >
                Back to Game
              </Button>
            </Card>
          </div>
        </ClickWrapper>
      )}

      <ClickWrapper onClick={() => setMenuVisible((v) => !v)}>
        <Card primary className="w-[40px] h-[40px] p-2">
          <div className="flex flex-row items-center">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2.5 10C2.5 11.9891 3.29018 13.8968 4.6967 15.3033C6.10322 16.7098 8.01088 17.5 10 17.5C11.9891 17.5 13.8968 16.7098 15.3033 15.3033C16.7098 13.8968 17.5 11.9891 17.5 10M2.5 10C2.5 8.0109 3.29018 6.10325 4.6967 4.69672C6.10322 3.2902 8.01088 2.50002 10 2.50002C11.9891 2.50002 13.8968 3.2902 15.3033 4.69672C16.7098 6.10325 17.5 8.0109 17.5 10M2.5 10H1M17.5 10H19M17.5 10H10L5.5 2.20502M1.543 13.077L2.953 12.564M17.048 7.43402L18.458 6.92102M3.106 15.785L4.256 14.821M15.746 5.17902L16.895 4.21502M5.501 17.795L6.251 16.495L10.002 10M13.751 3.50502L14.501 2.20502M8.438 18.863L8.698 17.386M11.303 2.61402L11.563 1.13702M11.563 18.863L11.303 17.386M8.698 2.61402L8.438 1.13702M14.5 17.794L13.75 16.495M16.894 15.785L15.745 14.821M4.256 5.17802L3.106 4.21402M18.458 13.078L17.048 12.565M2.954 7.43502L1.544 6.92102"
                stroke="#5D5D4C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Card>
      </ClickWrapper>
    </div>
  );
};
