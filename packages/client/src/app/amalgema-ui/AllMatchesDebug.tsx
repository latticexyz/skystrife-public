import { useEntityQuery } from "@latticexyz/react";
import { useAmalgema } from "../../useAmalgema";
import { Has } from "@latticexyz/recs";
import { MatchCard } from "./MatchCard";

export function AllMatchesDebug() {
  const {
    components: { MatchConfig, Match },
  } = useAmalgema();

  const allMatches = useEntityQuery([Has(MatchConfig), Has(Match)]);

  return (
    <div className="flex row">
      {allMatches.map((i) => {
        return (
          <div key={`match-${i}`} className="">
            <MatchCard matchEntity={i} />
          </div>
        );
      })}
    </div>
  );
}
