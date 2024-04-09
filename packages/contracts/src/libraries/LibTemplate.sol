// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { LastAction, Position, PositionData, OwnedBy } from "../codegen/index.sol";
import { instantiateTemplate } from "./templates/instantiateTemplate.sol";
import { entityToKeyTuple } from "./LibUtils.sol";
import { createMatchEntity } from "../createMatchEntity.sol";
import { setPosition } from "./LibPosition.sol";

function spawnTemplateAt(
  bytes32 matchEntity,
  bytes32 prototypeId,
  bytes32 ownerId,
  PositionData memory position
) returns (bytes32 entity) {
  entity = createMatchEntity(matchEntity);

  instantiateTemplate(prototypeId, entityToKeyTuple(matchEntity, entity));

  setPosition(matchEntity, entity, position);
  LastAction.set(matchEntity, entity, block.timestamp);
  OwnedBy.set(matchEntity, entity, ownerId);

  return entity;
}
