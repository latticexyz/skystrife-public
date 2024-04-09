// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;

import { Gold, LastAction, MatchConfig, MatchConfigData, ChargedByStart, Charger, Chargers, ChargeCap, ChargeCapData } from "../codegen/index.sol";

library LibGold {
  function addGold(bytes32 matchEntity, bytes32 entity, int32 amount) internal {
    Gold.set(matchEntity, entity, getCurrent(matchEntity, entity) + amount);
    LastAction.set(matchEntity, entity, block.timestamp);
  }

  function persistGold(bytes32 matchEntity, bytes32 entity) internal {
    int32 currentGold = getCurrent(matchEntity, entity);
    Gold.set(matchEntity, entity, currentGold);
    LastAction.set(matchEntity, entity, block.timestamp);
  }

  function spendGold(bytes32 matchEntity, bytes32 entity, int32 amount) internal {
    int32 currentGold = getCurrent(matchEntity, entity);
    require(currentGold >= amount, "not enough gold");

    LastAction.set(matchEntity, entity, block.timestamp);
    Gold.set(matchEntity, entity, currentGold - amount);
  }

  function getCurrent(bytes32 matchEntity, bytes32 entity) internal returns (int32) {
    int32 goldSinceLastAction = getChargerGoldRegen(matchEntity, entity); // Gold mines

    return Gold.get(matchEntity, entity) + goldSinceLastAction;
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

  function getChargerGoldRegen(bytes32 matchEntity, bytes32 chargee) internal returns (int32 extraGold) {
    bytes32[] memory chargers = Chargers.get(matchEntity, chargee);

    int32 currentTurn = getCurrentTurn(matchEntity);
    int32 turnsSinceLastAction = currentTurn - getTurnAt(matchEntity, LastAction.get(matchEntity, chargee));

    for (uint256 i; i < chargers.length; i++) {
      bytes32 chargeOrigin = chargers[i];

      int32 chargerGold;
      {
        uint256 startedAt = ChargedByStart.get(matchEntity, chargeOrigin);

        int32 extraGoldTurns = startedAt > LastAction.get(matchEntity, chargee)
          ? currentTurn - getTurnAt(matchEntity, startedAt)
          : turnsSinceLastAction;

        chargerGold = extraGoldTurns * Charger.get(matchEntity, chargeOrigin);
      }

      if (ChargeCap.getCap(matchEntity, chargeOrigin) > 0) {
        chargerGold = capChargerGold(matchEntity, chargeOrigin, chargerGold);
      }

      extraGold += chargerGold;
    }

    return extraGold;
  }

  function capChargerGold(bytes32 matchEntity, bytes32 charger, int32 amount) internal returns (int32) {
    ChargeCapData memory cap = ChargeCap.get(matchEntity, charger);

    if (amount + cap.totalCharged > cap.cap) {
      amount = cap.cap - cap.totalCharged;
    }

    ChargeCap.setTotalCharged(matchEntity, charger, cap.totalCharged + amount);

    return amount;
  }
}
