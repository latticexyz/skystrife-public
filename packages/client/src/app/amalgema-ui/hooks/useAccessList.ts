import { Entity, getComponentValue } from "@latticexyz/recs";
import { useAmalgema } from "../../../useAmalgema";
import { Hex } from "viem";

export function useAccessList(matchEntity: Entity) {
  const {
    components: { AllowList },
  } = useAmalgema();

  return (getComponentValue(AllowList, matchEntity)?.value ?? []) as Hex[];
}
