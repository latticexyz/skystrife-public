import { Entity } from "@latticexyz/recs";
import { MatchListingContainer } from "./MatchListingContainer";
import { MatchRow } from "./OpenMatches";

export function SpectateMatches({ matches }: { matches: Entity[] }) {
  return <MatchListingContainer allMatches={matches} matchRowComponent={MatchRow} />;
}
