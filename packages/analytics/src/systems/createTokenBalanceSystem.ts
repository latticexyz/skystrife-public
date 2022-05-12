import { Entity, Has, defineSystem, getComponentValueStrict, setComponent } from "@latticexyz/recs";
import { AnalyticsLayer } from "../types";
import { toEthAddress } from "@latticexyz/utils";

export function createTokenBalanceSystem(layer: AnalyticsLayer) {
  const {
    world,
    networkLayer: {
      components: { Orb_Balances },
    },
    components: { TokenBalanceSnapshot },
    utils: { getCurrentBlockNumber },
  } = layer;

  defineSystem(world, [Has(Orb_Balances)], ({ entity }) => {
    const tokenBalance = getComponentValueStrict(Orb_Balances, entity).value;

    setComponent(TokenBalanceSnapshot, `${entity}:${getCurrentBlockNumber()}` as Entity, {
      balance: Number(tokenBalance),
      mainWalletAddress: toEthAddress(entity),
      createdAtBlock: getCurrentBlockNumber(),
    });
  });
}
