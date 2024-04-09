// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;

import { MatchEntityCounter, Match } from "./codegen/index.sol";

// TODO: remove or replace?
function createMatchEntity(bytes32 matchEntity) returns (bytes32 entity) {
  uint32 entityIndex = MatchEntityCounter.get(matchEntity) + 1;
  MatchEntityCounter.set(matchEntity, entityIndex);
  entity = bytes32(uint256(entityIndex));
  // temporary workaround for frontend compat
  Match.set(matchEntity, entity, matchEntity);
}
