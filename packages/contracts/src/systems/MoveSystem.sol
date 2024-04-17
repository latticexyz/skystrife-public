// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";

import { LibGold } from "../libraries/LibGold.sol";
import { LibMove } from "../libraries/LibMove.sol";
import { isOwnedByAddress } from "../libraries/LibUtils.sol";
import { setPosition } from "../libraries/LibPosition.sol";

import { MatchConfig, Combat, Movable, LastAction, Position, PositionData, RequiresSetup } from "../codegen/index.sol";

import { matchHasStarted, getOwningPlayer, manhattan, addressToEntity } from "../libraries/LibUtils.sol";

import { LibAttack } from "base/libraries/LibAttack.sol";

contract MoveSystem is System {
  function _act(bytes32 matchEntity, bytes32 entity) internal {
    require(matchHasStarted(matchEntity), "match has not started");
    require(isOwnedByAddress(matchEntity, entity, _msgSender()), "you do not own this unit");

    uint256 lastActionAt = LastAction.get(matchEntity, entity);
    require(
      LibGold.getCurrentTurn(matchEntity) > LibGold.getTurnAt(matchEntity, lastActionAt),
      "not enough time has passed since last action"
    );

    LastAction.set(matchEntity, entity, block.timestamp);
  }

  function _move(bytes32 matchEntity, bytes32 entity, PositionData[] memory path) internal {
    bytes32 player = addressToEntity(_msgSender());

    bytes32 levelId = MatchConfig.getLevelId(matchEntity);

    int32 moveSpeed = Movable.get(matchEntity, entity);
    PositionData memory position = Position.get(matchEntity, entity);
    int32 requiredMovement = LibMove.calculateUsedMoveSpeed(matchEntity, levelId, player, position, path);
    require(moveSpeed >= requiredMovement, "not enough move speed");

    setPosition(matchEntity, entity, path[path.length - 1]);
  }

  function _attack(bytes32 matchEntity, bytes32 entity, bytes32 target) internal {
    require(getOwningPlayer(matchEntity, entity) != getOwningPlayer(matchEntity, target), "cannot attack own entity");
    require(Combat.getStrength(matchEntity, entity) > 0, "attacker has no strength");
    require(Combat.getHealth(matchEntity, target) > 0, "defender has no health");

    int32 minRange = Combat.getMinRange(matchEntity, entity);
    int32 maxRange = Combat.getMaxRange(matchEntity, entity);
    int32 distanceToTarget = manhattan(Position.get(matchEntity, entity), Position.get(matchEntity, target));
    require(distanceToTarget >= minRange, "target is below minimum range");
    require(distanceToTarget <= maxRange, "target is above maximum range");

    LibAttack.attack(matchEntity, entity, target);
  }

  function move(bytes32 matchEntity, bytes32 entity, PositionData[] memory path) public {
    _act(matchEntity, entity);

    _move(matchEntity, entity, path);
  }

  function fight(bytes32 matchEntity, bytes32 entity, bytes32 target) public {
    _act(matchEntity, entity);

    _attack(matchEntity, entity, target);
  }

  function moveAndAttack(bytes32 matchEntity, bytes32 entity, PositionData[] memory path, bytes32 target) public {
    require(!RequiresSetup.get(matchEntity, entity), "cannot move and attack");

    _act(matchEntity, entity);

    _move(matchEntity, entity, path);
    _attack(matchEntity, entity, target);
  }
}
