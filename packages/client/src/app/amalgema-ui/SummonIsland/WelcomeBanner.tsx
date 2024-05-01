import { SEASON_NAME } from "../../../constants";
import { CrossIcon } from "../../ui/Theme/CrossIcon";
import { Card } from "../../ui/Theme/SkyStrife/Card";
import { Body, Heading, Link } from "../../ui/Theme/SkyStrife/Typography";
import useLocalStorageState from "use-local-storage-state";
import { SeasonPassImg } from "../SeasonPassImg";
import { HOW_TO_PLAY_URL, DISCORD_URL } from "../../links";

export function Welcome() {
  const [open, setOpen] = useLocalStorageState(`welcome1-${SEASON_NAME}`, {
    defaultValue: true,
  });

  return (
    <>
      {open && (
        <>
          <Card primary className="p-0 px-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-4 items-center">
                <SeasonPassImg className="w-[100px] -ml-2" />
                <div className="flex flex-col">
                  <Heading className="text-[#1A6CBC]">Welcome to Sky Strife {SEASON_NAME}!</Heading>
                  <Body className="text-ss-text-default">
                    If you are new, be sure to read our{" "}
                    <Link
                      style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                      href={HOW_TO_PLAY_URL}
                    >
                      How to Play guide
                    </Link>{" "}
                    and join the official{" "}
                    <Link
                      style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                      href={DISCORD_URL}
                    >
                      Discord
                    </Link>
                    .
                    <br />
                    Start your Sky Strife journey by connecting your wallet!
                  </Body>
                </div>

                <div className="grow" />
                <button className="-mt-12" onClick={() => setOpen(false)}>
                  <CrossIcon />
                </button>
              </div>
            </div>
          </Card>

          <div className="h-6" />
        </>
      )}
    </>
  );
}
