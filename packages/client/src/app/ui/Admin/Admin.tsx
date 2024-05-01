import React, { useEffect, useState } from "react";
import { MapUpload } from "./MapUpload";
import { ClickWrapper } from "../Theme/ClickWrapper";
import { PrototypeSpawner } from "./PrototypeSpawner";
import { useMUD } from "../../../useMUD";
import { Body, OverlineLarge } from "../Theme/SkyStrife/Typography";
import { useComponentValue } from "@latticexyz/react";
import { ComponentBrowser } from "./ComponentBrowser";
import { singletonEntity } from "@latticexyz/store-sync/recs";

const Separator = () => <div className="border-b border-white-400 my-4 -mx-4" />;
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 className="self-start text-3xl text-white">{children}</h1>
);

export const Admin = () => {
  const [visible, setVisible] = useState(false);

  const {
    phaserLayer: {
      components: { HoverHighlight },
    },
  } = useMUD();

  const hoverLocation = useComponentValue(HoverHighlight, singletonEntity);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "\\") {
        setVisible((v) => !v);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      {visible && (
        <div className="fixed right-0 top-0 z-100 h-screen w-1/3">
          <div className="h-2/3">
            <ComponentBrowser />
          </div>

          <ClickWrapper className="h-1/3 bg-[#1b1c20] p-4 overflow-y-scroll">
            <Separator />

            <div>
              <SectionTitle>Prototypes</SectionTitle>
              <PrototypeSpawner />
            </div>

            <Separator />
            <OverlineLarge className="text-white"> Hover Location </OverlineLarge>
            <Body>
              {hoverLocation?.x}, {hoverLocation?.y}
            </Body>
          </ClickWrapper>
        </div>
      )}
    </>
  );
};
