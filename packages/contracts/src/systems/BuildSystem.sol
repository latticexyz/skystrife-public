// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";

import { LibGold } from "../libraries/LibGold.sol";
import { isOwnedByAddress, manhattan } from "../libraries/LibUtils.sol";
import { spawnTemplateAt } from "../libraries/LibTemplate.sol";

import { EntitiesAtPosition, Position, PositionData, Factory, Untraversable } from "../codegen/index.sol";

import { playerFromAddress, matchHasStarted } from "../libraries/LibUtils.sol";

contract BuildSystem is System {
  function build(
    bytes32 matchEntity,
    bytes32 factoryEntity,
    bytes32 templateId,
    PositionData memory coord
  ) public returns (bytes32) {
    PositionData memory factoryPosition = Position.get(matchEntity, factoryEntity);
    require(manhattan(factoryPosition, coord) == 1, "target position is not adjacent");
    require(isOwnedByAddress(matchEntity, factoryEntity, _msgSender()), "you do not own this factory");
    require(matchHasStarted(matchEntity), "match has not started");

    int32 goldCost;
    bool ableToBuildPrototype = false;
    bytes32[] memory templateIds = Factory.getPrototypeIds(matchEntity, factoryEntity);
    for (uint256 i = 0; i < templateIds.length; i++) {
      if (templateIds[i] == templateId) {
        ableToBuildPrototype = true;
        goldCost = Factory.getItemGoldCosts(matchEntity, factoryEntity, i);
        break;
      }
    }
    require(ableToBuildPrototype, "this factory does not have this template");

    bytes32[] memory entitiesAtPosition = EntitiesAtPosition.get(matchEntity, coord.x, coord.y);
    for (uint256 i = 0; i < entitiesAtPosition.length; i++) {
      require(!Untraversable.get(matchEntity, entitiesAtPosition[i]), "entity blocking position");
    }

    bytes32 player = playerFromAddress(matchEntity, _msgSender());

    LibGold.spendGold(matchEntity, player, goldCost);

    return spawnTemplateAt(matchEntity, templateId, player, coord);
  }
}
