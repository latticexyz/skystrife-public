import { Entity } from "@latticexyz/recs";
import { ViewOnlyMatchListingContainer } from "./MatchListingContainer";
import { ViewOnlyMatchRow } from "./ViewOnlyMatchRow";

export function HistoricalMatches({ matches }: { matches: Entity[] }) {
  return <ViewOnlyMatchListingContainer allMatches={matches} matchRowComponent={ViewOnlyMatchRow} />;
}
