import {
  defineEnterSystem,
  defineRxSystem,
  defineSystem,
  Entity,
  getComponentValue,
  getComponentValueStrict,
  Has,
  hasComponent,
  HasValue,
  Not,
  removeComponent,
  runQuery,
  setComponent,
} from "@latticexyz/recs";
import { HeadlessLayer } from "../../types";
import { getCurrentTurn } from "../../../Network/utils";
import { BigNumber } from "ethers";
import { StructureTypes } from "../../../Network";
import { decodeMatchEntity } from "../../../../decodeMatchEntity";

export function createCurrentGoldSystem(layer: HeadlessLayer) {
  const {
    world,
    turn$,
    parentLayers: {
      network: {
        components: { Transaction },

        network: {
          clock,
          components: {
            Gold,
            LastAction,
            ChargedByStart,
            Chargee,
            Charger,
            UnitType,

            Combat,
            StructureType,
            OwnedBy,
          },
        },
        components: { NetworkChargeCap, ChargeCap },
        utils: { getTurnAtTimeForCurrentMatch },
        api: { getCurrentMatchConfig },
      },
    },
    components: { LocalGold, Depleted, InCurrentMatch },
  } = layer;

  const setLocalGoldToCurrentTurn = (entity: Entity) => {
    const matchConfig = getCurrentMatchConfig();

    if (!matchConfig) return;

    const currentTurn = getCurrentTurn(
      BigNumber.from(matchConfig.startTime),
      BigNumber.from(matchConfig.turnLength),
      clock,
    );
    const lastAction = getComponentValue(LastAction, entity);
    if (!lastAction) return;

    const lastActionAt = lastAction.value;
    const turnsSinceLastAction = currentTurn - getTurnAtTimeForCurrentMatch(Number(lastActionAt));
    let localGold = 0;

    const chargers = [
      ...runQuery([Has(InCurrentMatch), HasValue(Chargee, { value: decodeMatchEntity(entity).entity })]),
    ];
    chargers.forEach((charger) => {
      const chargeValue = getComponentValue(Charger, charger)?.value;
      if (!chargeValue) return;

      const chargingStartedAt = getComponentValueStrict(ChargedByStart, charger).value;
      let extraGoldTurns: number;
      if (chargingStartedAt > lastActionAt) {
        extraGoldTurns = currentTurn - getTurnAtTimeForCurrentMatch(Number(chargingStartedAt));
      } else {
        extraGoldTurns = turnsSinceLastAction;
      }

      let amount = extraGoldTurns * chargeValue;
      if (hasComponent(NetworkChargeCap, charger)) {
        const { cap, totalCharged } = getComponentValueStrict(NetworkChargeCap, charger);
        if (totalCharged + amount >= cap) {
          setComponent(Depleted, charger, { value: true });

          // Hack to prevent players from attacking depleted mines
          if (getComponentValue(StructureType, charger)?.value === StructureTypes.GoldMine) {
            removeComponent(Combat, charger);
            removeComponent(OwnedBy, charger);
          }
          amount = cap - totalCharged;
        }

        setComponent(ChargeCap, charger, { totalCharged: amount + totalCharged, cap });
      }

      localGold += amount;
    });

    if (localGold < 0) localGold = 0;

    setComponent(LocalGold, entity, { current: localGold });
  };

  defineSystem(
    world,
    [Has(Gold), Has(InCurrentMatch)],
    ({ entity, value }) => {
      const [newValue] = value;
      const newCurrentGold = newValue?.current;
      if (newCurrentGold == null) return;

      setLocalGoldToCurrentTurn(entity);
    },
    { runOnInit: true },
  );

  // This system is needed to properly update GoldMines
  defineSystem(
    world,
    [Has(Gold), Has(ChargeCap), Has(StructureType), Has(Combat), Has(OwnedBy), Has(InCurrentMatch)],
    ({ entity, value }) => {
      const [newValue] = value;
      const newCurrentGold = newValue?.current;
      if (newCurrentGold == null) return;

      setLocalGoldToCurrentTurn(entity);
    },
    { runOnInit: true },
  );

  defineEnterSystem(world, [Has(Gold), Has(InCurrentMatch)], ({ entity }) => {
    setLocalGoldToCurrentTurn(entity);
  });

  // on first load, refresh everything with gold
  defineSystem(world, [Has(Gold), Has(LastAction), Has(InCurrentMatch)], ({ entity }) => {
    setLocalGoldToCurrentTurn(entity);
  });

  defineRxSystem(world, turn$, () => {
    for (const entity of [...runQuery([Has(Gold), Has(InCurrentMatch)])]) {
      setLocalGoldToCurrentTurn(entity);
    }
  });

  // triggered when a unit is built and chargers are updated on contract
  defineSystem(world, [Has(NetworkChargeCap), Has(Gold), Has(InCurrentMatch)], ({ entity }) => {
    setLocalGoldToCurrentTurn(entity);
  });

  // Add the ChargeCap component on initial load
  defineSystem(world, [Has(NetworkChargeCap), Has(InCurrentMatch), Not(ChargeCap)], ({ entity }) => {
    const val = getComponentValueStrict(NetworkChargeCap, entity);
    setComponent(ChargeCap, entity, val);
  });

  defineEnterSystem(world, [Has(Transaction), HasValue(Transaction, { status: "completed" })], ({ entity }) => {
    const txData = getComponentValue(Transaction, entity);
    if (!txData) return;

    if (txData.entity && hasComponent(UnitType, txData.entity)) setLocalGoldToCurrentTurn(txData.entity);
  });
}
