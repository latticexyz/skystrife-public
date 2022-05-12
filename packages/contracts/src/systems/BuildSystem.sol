// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";

import { LibStamina } from "../libraries/LibStamina.sol";
import { isOwnedBy, manhattan } from "../libraries/LibUtils.sol";
import { spawnTemplateAt } from "../libraries/LibTemplate.sol";

import { EntitiesAtPosition, Position, PositionData, Factory, Untraversable } from "../codegen/index.sol";

import { addressToEntity, playerFromAddress, matchHasStarted } from "../libraries/LibUtils.sol";

contract BuildSystem is System {
  function build(
    bytes32 matchEntity,
    bytes32 factoryEntity,
    bytes32 templateId,
    PositionData memory coord
  ) public returns (bytes32) {
    PositionData memory factoryPosition = Position.get(matchEntity, factoryEntity);
    require(manhattan(factoryPosition, coord) == 1, "target position is not adjacent");
    require(isOwnedBy(matchEntity, factoryEntity, addressToEntity(_msgSender())), "you do not own this factory");
    require(matchHasStarted(matchEntity), "match has not started");

    int32 staminaCost;
    bool ableToBuildPrototype = false;
    bytes32[] memory templateIds = Factory.getPrototypeIds(matchEntity, factoryEntity);
    for (uint256 i = 0; i < templateIds.length; i++) {
      if (templateIds[i] == templateId) {
        ableToBuildPrototype = true;
        staminaCost = Factory.getItemStaminaCosts(matchEntity, factoryEntity, i);
        break;
      }
    }
    require(ableToBuildPrototype, "this factory does not have this template");

    bytes32[] memory entitiesAtPosition = EntitiesAtPosition.get(matchEntity, coord.x, coord.y);
    for (uint256 i = 0; i < entitiesAtPosition.length; i++) {
      require(!Untraversable.get(matchEntity, entitiesAtPosition[i]), "entity blocking position");
    }

    bytes32 player = playerFromAddress(matchEntity, _msgSender());

    LibStamina.spendStamina(matchEntity, player, staminaCost);

    return spawnTemplateAt(matchEntity, templateId, player, coord);
  }
}
