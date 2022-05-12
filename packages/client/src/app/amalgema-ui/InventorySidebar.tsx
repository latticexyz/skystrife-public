import { Entity } from "@latticexyz/recs";
import { useAmalgema } from "../../useAmalgema";
import { IconButton } from "../ui/Theme/SkyStrife/IconButton";
import { Discord } from "../ui/Theme/SkyStrife/Icons/Discord";
import { Body, OverlineSmall, Caption } from "../ui/Theme/SkyStrife/Typography";
import { Button } from "../ui/Theme/SkyStrife/Button";
import { Twitter } from "../ui/Theme/SkyStrife/Icons/Twitter";
import { DISCORD_URL, FEEDBACK_URL, HOW_TO_PLAY_URL, TWITTER_URL } from "../links";
import { CurrentProfile } from "./CurrentProfile";
import { formatEther } from "viem";
import { addressToEntityID } from "../../mud/setupNetwork";
import { Tutorial } from "../ui/Theme/SkyStrife/Icons/Tutorial";
import { useComponentValue } from "@latticexyz/react";
import { EMOJI } from "../../constants";
import { LabeledOrbInput } from "./SummonIsland/common";
import { SessionWalletManager } from "./SessionWalletManager";
import { SeasonPass } from "./SeasonPass";
import { useExternalAccount } from "./hooks/useExternalAccount";
import { HoleskyEth } from "./HoleskyEth";

const DECIMALS = 18;

function Resources() {
  const {
    externalWalletClient,
    components: { ERC20Registry, Orb_Balances },
  } = useAmalgema();

  const { address } = useExternalAccount();

  const registry = useComponentValue(
    ERC20Registry,
    "0x6e734f7262000000000000000000000000000000000000000000000000000000" as Entity // TODO: encodeNamespace?
  );

  const balance = useComponentValue(Orb_Balances, address ? addressToEntityID(address) : ("0" as Entity));

  return (
    <div
      className="flex justify-between"
      onClick={() => {
        if (externalWalletClient && registry) {
          externalWalletClient.watchAsset({
            type: "ERC20",
            options: {
              address: registry.erc20Address,
              decimals: DECIMALS,
              symbol: EMOJI,
            },
          });
        }
      }}
    >
      <LabeledOrbInput amount={BigInt(formatEther(balance?.value || 0n))} label="My Resources" />
    </div>
  );
}

export function InventorySidebar() {
  const { address } = useExternalAccount();

  return (
    <div className="flex flex-col flex-1 bg-ss-bg-1 border-l border-ss-stroke h-screen overflow-y-auto w-full p-8 pt-4 items-stretch">
      <CurrentProfile />
      <div className="h-4 shrink-0" />

      <HoleskyEth />

      <div className="h-4 shrink-0"></div>

      <SeasonPass account={address} />
      <div className="h-4" />

      {address && (
        <>
          <div className="h-8 shrink-0" />
          <SessionWalletManager />
        </>
      )}

      <div className="h-8 shrink-0" />

      <Resources />

      <div className="h-2 shrink-0" />

      <LabeledOrbInput amount={100n} label="Match Creation Cost" />

      <div className="h-2 shrink-0" />

      <div className="h-[100%]" />

      <OverlineSmall>How to Play</OverlineSmall>
      <div className="h-2 shrink-0" />
      <div className="bg-ss-bg-0 rounded border border-ss-stroke w-full flex flex-col p-4">
        <ol className="list-decimal px-4">
          <li>
            <Body className="text-ss-text-default">
              Players spawn with a castle, hero, and 1,000 gold to summon units with.
            </Body>
          </li>
          <div className="h-2" />

          <li>
            <Body className="text-ss-text-default">Capture mines to generate more gold.</Body>
          </li>
          <div className="h-2" />

          <li>
            <Body className="text-ss-text-default">
              Fight your opponent’s armies and destroy their castle to defeat them.
            </Body>
          </li>
          <div className="h-2" />

          <li>
            <Body className="text-ss-text-default">Be the last castle standing to win.</Body>
          </li>
          <div className="h-2" />

          <li>
            <Body className="text-ss-text-default">
              The top players earn {EMOJI} which can be used to create more matches.
            </Body>
          </li>
        </ol>
      </div>

      <div className="h-6 shrink-0" />

      <div className="flex h-fit">
        <a href={FEEDBACK_URL} className="grow" target="_blank" rel="noreferrer">
          <Button
            style={{
              fontSize: "12px",
            }}
            className="w-full text-sm"
            buttonType="tertiary"
          >
            Submit Feedback
          </Button>
        </a>

        <div className="w-8" />

        <a href={DISCORD_URL} target="_blank" rel="noreferrer">
          <IconButton>
            <Discord />
          </IconButton>
        </a>

        <div className="w-2" />

        <a href={TWITTER_URL} target="_blank" rel="noreferrer">
          <IconButton>
            <Twitter />
          </IconButton>
        </a>

        <div className="w-2" />

        <a href={HOW_TO_PLAY_URL} target="_blank" rel="noreferrer">
          <IconButton>
            <Tutorial />
          </IconButton>
        </a>
      </div>
    </div>
  );
}
