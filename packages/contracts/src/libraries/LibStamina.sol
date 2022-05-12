// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";

import { Stamina, LastAction, MatchConfig, MatchConfigData, Chargee, ChargeeTableId, ChargedByStart, Charger, Chargers, ChargeCap, ChargeCapData, Position } from "../codegen/index.sol";

library LibStamina {
  function fillStamina(bytes32 matchEntity, bytes32 entity) internal {
    LastAction.set(matchEntity, entity, block.timestamp);
    Stamina.set(matchEntity, entity, 1_000_000);
  }

  function addStamina(bytes32 matchEntity, bytes32 entity, int32 amount) internal {
    Stamina.set(matchEntity, entity, getCurrent(matchEntity, entity) + amount);
    LastAction.set(matchEntity, entity, block.timestamp);
  }

  function persistStamina(bytes32 matchEntity, bytes32 entity) internal {
    int32 currentStamina = getCurrent(matchEntity, entity);
    Stamina.set(matchEntity, entity, currentStamina);
    LastAction.set(matchEntity, entity, block.timestamp);
  }

  function spendStamina(bytes32 matchEntity, bytes32 entity, int32 amount) internal {
    int32 currentStamina = getCurrent(matchEntity, entity);
    require(currentStamina >= amount, "not enough stamina");

    LastAction.set(matchEntity, entity, block.timestamp);
    Stamina.set(matchEntity, entity, currentStamina - amount);
  }

  function getCurrent(bytes32 matchEntity, bytes32 entity) internal returns (int32) {
    int32 staminaSinceLastAction = getChargerStaminaRegen(matchEntity, entity); // Gold mines

    return Stamina.get(matchEntity, entity) + staminaSinceLastAction;
  }

  function getCurrentTurn(bytes32 matchEntity) internal view returns (int32) {
    return getTurnAt(matchEntity, block.timestamp);
  }

  function getTurnAt(bytes32 matchEntity, uint256 atTime) internal view returns (int32) {
    MatchConfigData memory matchConfig = MatchConfig.get(matchEntity);
    if (atTime < matchConfig.startTime) return 0;

    uint256 secondsSinceAction = atTime - matchConfig.startTime;
    return int32(uint32(secondsSinceAction / matchConfig.turnLength));
  }

  function getChargerStaminaRegen(bytes32 matchEntity, bytes32 chargee) internal returns (int32 extraStamina) {
    bytes32[] memory chargers = Chargers.get(matchEntity, chargee);

    int32 currentTurn = getCurrentTurn(matchEntity);
    int32 turnsSinceLastAction = currentTurn - getTurnAt(matchEntity, LastAction.get(matchEntity, chargee));

    for (uint256 i; i < chargers.length; i++) {
      bytes32 chargeOrigin = chargers[i];

      int32 chargerStamina;
      {
        uint256 startedAt = ChargedByStart.get(matchEntity, chargeOrigin);

        int32 extraStaminaTurns = startedAt > LastAction.get(matchEntity, chargee)
          ? currentTurn - getTurnAt(matchEntity, startedAt)
          : turnsSinceLastAction;

        chargerStamina = extraStaminaTurns * Charger.get(matchEntity, chargeOrigin);
      }

      if (ChargeCap.getCap(matchEntity, chargeOrigin) > 0) {
        chargerStamina = capChargerStamina(matchEntity, chargeOrigin, chargerStamina);
      }

      extraStamina += chargerStamina;
    }

    return extraStamina;
  }

  function capChargerStamina(bytes32 matchEntity, bytes32 charger, int32 amount) internal returns (int32) {
    ChargeCapData memory cap = ChargeCap.get(matchEntity, charger);

    if (amount + cap.totalCharged > cap.cap) {
      amount = cap.cap - cap.totalCharged;
    }

    ChargeCap.setTotalCharged(matchEntity, charger, cap.totalCharged + amount);

    return amount;
  }
}
