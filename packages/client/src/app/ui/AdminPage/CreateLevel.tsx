import { useEffect, useRef } from "react";
import { BrutalistCard } from "../Theme/BrutalistCard";
import useOnClickOutside from "../hooks/useOnClickOutside";
import { OverlineLarge } from "../Theme/SkyStrife/Typography";
import { CrossIcon } from "../Theme/CrossIcon";
import { Button } from "../Theme/SkyStrife/Button";
import { MapUpload } from "../Admin/MapUpload";

export const CreateLevel = ({ close }: { close: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [close]);

  useOnClickOutside(ref, close);

  return (
    <div
      style={{
        background: "rgba(24, 23, 16, 0.65)",
        zIndex: 100,
      }}
      className="fixed top-0 left-0 w-screen h-screen flex flex-col justify-around"
    >
      <div ref={ref} className="mx-auto">
        <BrutalistCard className="h-fit">
          <div className="p-8">
            <div className="flex w-full justify-between">
              <OverlineLarge>Create Level</OverlineLarge>
              <Button buttonType="tertiary" onClick={close} className="h-fit">
                <CrossIcon />
              </Button>
            </div>
          </div>

          <MapUpload />
        </BrutalistCard>
      </div>
    </div>
  );
};
