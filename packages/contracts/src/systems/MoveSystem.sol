// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { SystemSwitch } from "@latticexyz/world-modules/src/utils/SystemSwitch.sol";

import { LibStamina } from "../libraries/LibStamina.sol";
import { LibMove } from "../libraries/LibMove.sol";
import { isOwnedBy } from "../libraries/LibUtils.sol";
import { setPosition } from "../libraries/LibPosition.sol";

import { MatchConfig, Combat, Movable, LastAction, Position, PositionData, Range, RangeData, Stamina } from "../codegen/index.sol";

import { addressToEntity, matchHasStarted, getOwningPlayer, manhattan, min } from "../libraries/LibUtils.sol";

import { AttackSystem } from "./AttackSystem.sol";

contract MoveSystem is System {
  function _act(bytes32 matchEntity, bytes32 entity) internal {
    require(matchHasStarted(matchEntity), "match has not started");
    require(isOwnedBy(matchEntity, entity, addressToEntity(_msgSender())), "you do not own this unit");

    uint256 lastActionAt = LastAction.get(matchEntity, entity);
    require(
      LibStamina.getCurrentTurn(matchEntity) > LibStamina.getTurnAt(matchEntity, lastActionAt),
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

    RangeData memory range = Range.get(matchEntity, entity);
    int32 distanceToTarget = manhattan(Position.get(matchEntity, entity), Position.get(matchEntity, target));
    require(distanceToTarget >= range.min, "target is below minimum range");
    require(distanceToTarget <= range.max, "target is above maximum range");

    SystemSwitch.call(abi.encodeCall(AttackSystem.attack, (matchEntity, entity, target)));
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
    _act(matchEntity, entity);

    _move(matchEntity, entity, path);
    _attack(matchEntity, entity, target);
  }
}
