import { Entity } from "@latticexyz/recs";
import { UnitTypes } from "../../../layers/Network";

export type BuildData = { factory: Entity; unitType: UnitTypes; goldCost: number; prototypeId: Entity };
