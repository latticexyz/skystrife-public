import { Entity } from "@latticexyz/recs";

export function getMatchUrl(matchEntity: Entity): string {
  const params = new URLSearchParams(window.location.search);
  params.append("match", matchEntity);

  return `/match?${params.toString()}`;
}
