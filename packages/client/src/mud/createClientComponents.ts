import { Type, defineComponent } from "@latticexyz/recs";
import { SetupNetworkResult } from "./setupNetwork";

export type ClientComponents = ReturnType<typeof createClientComponents>;

export function createClientComponents({ components, world }: SetupNetworkResult) {
  return {
    ...components,
    NetworkChargeCap: components.ChargeCap,
    ChargeCap: defineComponent(world, components.ChargeCap.schema, {
      metadata: components.ChargeCap.metadata,
    }),
    Transaction: defineComponent(world, {
      entity: Type.OptionalEntity,
      systemCall: Type.String,
      systemId: Type.String,
      gasEstimate: Type.OptionalBigInt,
      manualGasEstimate: Type.Boolean,
      gasPrice: Type.OptionalBigInt,
      status: Type.String,
      hash: Type.OptionalString,
      error: Type.OptionalString,
      submittedBlock: Type.OptionalBigInt,
      completedBlock: Type.OptionalBigInt,
      submittedTimestamp: Type.OptionalBigInt,
      completedTimestamp: Type.OptionalBigInt,
    }),
  };
}
