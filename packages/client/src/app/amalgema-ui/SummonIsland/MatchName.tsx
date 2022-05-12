import { useEffect, useState } from "react";
import { OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { RequiredAsterisk } from "./common";
import { twMerge } from "tailwind-merge";

export function MatchName({
  matchName,
  setMatchName,
}: {
  matchName: string;
  setMatchName: (matchName: string) => void;
}) {
  const MAX_MATCH_NAME_LENGTH = 24;
  const [matchNameError, setMatchNameError] = useState<string | null>(null);

  useEffect(() => {
    if (matchName.length === 0) {
      setMatchNameError(`Match name is required.`);
    } else {
      setMatchNameError(null);
    }
  }, [matchName, setMatchName]);

  return (
    <>
      <OverlineSmall className="w-full text-left text-ss-text-x-light">
        match name
        <RequiredAsterisk />
      </OverlineSmall>

      <input
        className={twMerge("w-full h-12 px-4 rounded-md border", matchNameError && "border-red-500")}
        value={matchName}
        maxLength={MAX_MATCH_NAME_LENGTH}
        onChange={(e) => setMatchName(e.target.value)}
        placeholder="Enter match name"
      />
      <div className="h-1" />
      <p className="w-full text-left text-ss-text-x-light text-[12px]">
        24 characters max - {24 - matchName.length} characters remaining. &nbsp;
        {matchNameError && <span className="text-red-500 text-[12px] normal-case">{matchNameError}</span>}
      </p>
    </>
  );
}
