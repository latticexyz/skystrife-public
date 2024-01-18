import { useEffect, useRef, useState } from "react";
import { Button } from "../../ui/Theme/SkyStrife/Button";
import { Caption, OverlineLarge } from "../../ui/Theme/SkyStrife/Typography";
import { Card } from "../../ui/Theme/SkyStrife/Card";
import { useAmalgema } from "../../../useAmalgema";
import { Plus } from "../../ui/Theme/SkyStrife/Icons/Plus";
import { Has, HasValue } from "@latticexyz/recs";
import { useEntityQuery } from "@latticexyz/react";
import { Hex } from "viem";

import "./select-reset.css";
import { ChooseLevel } from "./ChooseLevel";
import { MatchCost } from "./MatchCost";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MatchType } from "./MatchType";
import { EntranceFee } from "./EntranceFee";
import { MatchRewards } from "./MatchRewards";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useSeasonPassExternalWallet } from "../hooks/useSeasonPass";
import { MatchName } from "./MatchName";

function ArrowSvg() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 6L6 1M6 1L1 6M6 1V13"
        stroke="#25241D"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Store all the state for the multi-step Match config form.
 */
function SummonIslandForm({ closeModal }: { closeModal: () => void }) {
  const {
    network: {
      components: { LevelTemplates, LevelInStandardRotation },
    },
  } = useAmalgema();

  const [scrollPercent, setScrollPercent] = useState(0);
  const scrollDiv = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scrollDiv.current) return;

    const div = scrollDiv.current;

    const handleScroll = () => {
      const scrollTop = div.scrollTop ?? 0;
      const scrollHeight = div.scrollHeight ?? 0;
      const clientHeight = div.clientHeight ?? 0;
      const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;

      setScrollPercent(scrollPercent);
    };
    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, []);

  const hasSeasonPass = useSeasonPassExternalWallet();

  const [matchName, setMatchName] = useState("");

  const standardLevels = useEntityQuery([Has(LevelTemplates), HasValue(LevelInStandardRotation, { value: true })]);
  const [levelId, setLevelId] = useState<string>(standardLevels[0] ?? "");

  const [matchType, setMatchType] = useState<"public" | "private" | "season-pass">("public");
  const [allowedAddresses, setAllowedAddresses] = useState<string[]>([]);

  const [entranceFee, setEntranceFee] = useState(0n);
  const [rewardPercentages, setRewardPercentages] = useState<bigint[]>([]);

  return (
    <div
      style={{
        background: "rgba(24, 23, 16, 0.65)",
        zIndex: 100,
      }}
      className="fixed top-0 left-0 w-screen h-screen flex flex-col justify-around"
    >
      <Card className="relative w-[640px] max-w-[640px] h-3/4 mx-auto p-0">
        <Header closeModal={closeModal} />

        <div ref={scrollDiv} className="h-full overflow-y-scroll px-6">
          <div className="h-20" />

          <MatchName matchName={matchName} setMatchName={setMatchName} />

          <div className="h-12" />

          <ChooseLevel
            hasSeasonPass={hasSeasonPass}
            levelId={levelId}
            setLevelId={setLevelId}
            setRewardPercentages={setRewardPercentages}
          />

          <div className="h-12" />

          <MatchCost />

          <div className="h-12" />

          <EntranceFee
            hasSeasonPass={hasSeasonPass}
            entranceFee={entranceFee}
            setEntranceFee={setEntranceFee}
            levelId={levelId as Hex}
          />

          <div className="h-12" />

          <MatchRewards
            entranceFee={entranceFee}
            rewardPercentages={rewardPercentages}
            setRewardPercentages={setRewardPercentages}
            levelId={levelId as Hex}
          />

          <div className="h-6" />

          <MatchType
            matchType={matchType}
            setMatchType={setMatchType}
            allowedAddresses={allowedAddresses}
            setAllowedAddresses={setAllowedAddresses}
            levelId={levelId as Hex}
            hasSeasonPass={hasSeasonPass}
          />

          <div
            style={{
              left: "calc(50% - 40px)",
              bottom: "100px",
              boxShadow: "2px 2px 8px 0px rgba(24, 23, 16, 0.16), 2px 2px 16px 0px rgba(24, 23, 16, 0.12)",
              display: scrollPercent < 100 ? "flex" : "none",
            }}
            className="absolute bg-white rounded-lg p-2 w-[80px] justify-around"
          >
            <div
              style={{
                transform: "rotate(180deg)",
              }}
            >
              <ArrowSvg />
            </div>
          </div>

          <div className="h-20" />
          <div className="h-10" />
        </div>

        <Footer
          close={closeModal}
          matchName={matchName}
          levelId={levelId as Hex}
          matchType={matchType}
          allowedAddresses={allowedAddresses as Hex[]}
          entranceFee={entranceFee}
          rewardPercentages={rewardPercentages}
        />
      </Card>
    </div>
  );
}

export function useSummonIslandModal() {
  const [modalOpen, setModalOpen] = useState(false);

  return {
    modalOpen,
    setModalOpen,
    modal: modalOpen ? <SummonIslandForm closeModal={() => setModalOpen(false)} /> : <></>,
  };
}
