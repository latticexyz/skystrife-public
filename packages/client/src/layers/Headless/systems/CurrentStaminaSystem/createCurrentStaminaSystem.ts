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

export function createCurrentStaminaSystem(layer: HeadlessLayer) {
  const {
    world,
    turn$,
    parentLayers: {
      network: {
        components: { Transaction },

        network: {
          clock,
          components: {
            Stamina,
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
    components: { LocalStamina, Depleted, InCurrentMatch },
  } = layer;

  const setLocalStaminaToCurrentTurn = (entity: Entity) => {
    const matchConfig = getCurrentMatchConfig();

    if (!matchConfig) return;

    const currentTurn = getCurrentTurn(
      BigNumber.from(matchConfig.startTime),
      BigNumber.from(matchConfig.turnLength),
      clock
    );
    const lastAction = getComponentValue(LastAction, entity);
    if (!lastAction) return;

    const lastActionAt = lastAction.value;
    const turnsSinceLastAction = currentTurn - getTurnAtTimeForCurrentMatch(Number(lastActionAt));
    let localStamina = 0;

    const chargers = [
      ...runQuery([Has(InCurrentMatch), HasValue(Chargee, { value: decodeMatchEntity(entity).entity })]),
    ];
    chargers.forEach((charger) => {
      const chargeValue = getComponentValue(Charger, charger)?.value;
      if (!chargeValue) return;

      const chargingStartedAt = getComponentValueStrict(ChargedByStart, charger).value;
      let extraStaminaTurns: number;
      if (chargingStartedAt > lastActionAt) {
        extraStaminaTurns = currentTurn - getTurnAtTimeForCurrentMatch(Number(chargingStartedAt));
      } else {
        extraStaminaTurns = turnsSinceLastAction;
      }

      let amount = extraStaminaTurns * chargeValue;
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

      localStamina += amount;
    });

    if (localStamina < 0) localStamina = 0;

    setComponent(LocalStamina, entity, { current: localStamina });
  };

  defineSystem(
    world,
    [Has(Stamina), Has(InCurrentMatch)],
    ({ entity, value }) => {
      const [newValue] = value;
      const newCurrentStamina = newValue?.current;
      if (newCurrentStamina == null) return;

      setLocalStaminaToCurrentTurn(entity);
    },
    { runOnInit: true }
  );

  // This system is needed to properly update GoldMines
  defineSystem(
    world,
    [Has(Stamina), Has(ChargeCap), Has(StructureType), Has(Combat), Has(OwnedBy), Has(InCurrentMatch)],
    ({ entity, value }) => {
      const [newValue] = value;
      const newCurrentStamina = newValue?.current;
      if (newCurrentStamina == null) return;

      setLocalStaminaToCurrentTurn(entity);
    },
    { runOnInit: true }
  );

  defineEnterSystem(world, [Has(Stamina), Has(InCurrentMatch)], ({ entity }) => {
    setLocalStaminaToCurrentTurn(entity);
  });

  // on first load, refresh everything with stamina
  defineSystem(world, [Has(Stamina), Has(LastAction), Has(InCurrentMatch)], ({ entity }) => {
    setLocalStaminaToCurrentTurn(entity);
  });

  defineRxSystem(world, turn$, () => {
    for (const entity of [...runQuery([Has(Stamina), Has(InCurrentMatch)])]) {
      setLocalStaminaToCurrentTurn(entity);
    }
  });

  // triggered when a unit is built and chargers are updated on contract
  defineSystem(world, [Has(NetworkChargeCap), Has(Stamina), Has(InCurrentMatch)], ({ entity }) => {
    setLocalStaminaToCurrentTurn(entity);
  });

  // Add the ChargeCap component on initial load
  defineSystem(world, [Has(NetworkChargeCap), Has(InCurrentMatch), Not(ChargeCap)], ({ entity }) => {
    const val = getComponentValueStrict(NetworkChargeCap, entity);
    setComponent(ChargeCap, entity, val);
  });

  defineEnterSystem(world, [Has(Transaction), HasValue(Transaction, { status: "completed" })], ({ entity }) => {
    const txData = getComponentValue(Transaction, entity);
    if (!txData) return;

    if (txData.entity && hasComponent(UnitType, txData.entity)) setLocalStaminaToCurrentTurn(txData.entity);
  });
}
