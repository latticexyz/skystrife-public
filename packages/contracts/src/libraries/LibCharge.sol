// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";

import { ChargedByStart, Charger, Chargers, Chargee, Gold } from "../codegen/index.sol";

import { ArrayLib } from "@latticexyz/world-modules/src/modules/utils/ArrayLib.sol";

using ArrayLib for bytes32[];

/**
 * Used to increase the Gold regeneration of an entity
 * by "charging" it with another entity.
 * This is how Gold is implemented.
 * A bunch of Gold Mines "charge" the player.
 */
function charge(bytes32 matchEntity, bytes32 charger, bytes32 chargee) {
  bytes32 previousChargee = Chargee.get(matchEntity, charger);
  bytes32[] memory chargersForPreviousChargee = Chargers.get(matchEntity, previousChargee).filter(charger);
  if (chargersForPreviousChargee.length > 0) {
    Chargers.set(matchEntity, previousChargee, chargersForPreviousChargee);
  } else {
    Chargers.deleteRecord(matchEntity, previousChargee);
  }

  Chargers.push(matchEntity, chargee, charger);
  Chargee.set(matchEntity, charger, chargee);
  ChargedByStart.set(matchEntity, charger, block.timestamp);
}
