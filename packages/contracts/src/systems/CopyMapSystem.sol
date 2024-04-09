// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";

import { LevelTemplates, Position, MatchConfig, MatchConfigData, MatchReward, MatchMapCopyProgress, MatchReady, SpawnPoint, SkyPoolConfig, Admin, MatchSky, VirtualLevelTemplates } from "../codegen/index.sol";
import { SpawnSettlementTemplateId } from "../codegen/Templates.sol";

import { createMatchEntity } from "../createMatchEntity.sol";
import { addressToEntity, entityToKeyTuple } from "../libraries/LibUtils.sol";
import { instantiateLevelEntity } from "../libraries/levels/instantiateLevel.sol";
import { startMatchIfAllRegistered, startMatchIfAllReady } from "../libraries/LibMatch.sol";

uint256 constant ENTITIES_PER_COPY = 1000;

contract CopyMapSystem is System {
  function copyMap(bytes32 matchEntity) public {
    require(MatchConfig.getTurnLength(matchEntity) != 0, "match does not exist");
    require(MatchConfig.getStartTime(matchEntity) == 0, "match has already started");

    uint256 copyProgress = MatchMapCopyProgress.get(matchEntity);
    bytes32 levelId = MatchConfig.getLevelId(matchEntity);
    uint256 size = LevelTemplates.length(levelId);

    uint256 offset = copyProgress;
    uint256 limit = copyProgress + ENTITIES_PER_COPY;
    if (limit > size) {
      limit = size;
    }

    for (uint256 i = offset; i < limit; i++) {
      // If the template is a spawn point, it is instantiated during player registration instead
      // If the template is virtual, it is not instantiated at all
      bytes32 templateId = LevelTemplates.getItem(levelId, i);
      if (templateId != SpawnSettlementTemplateId && !VirtualLevelTemplates.get(templateId)) {
        bytes32 levelEntity = createMatchEntity(matchEntity);
        instantiateLevelEntity(levelId, i, entityToKeyTuple(matchEntity, levelEntity));
      }
    }

    MatchMapCopyProgress.set(matchEntity, limit);
    if (limit == size) {
      MatchReady.set(matchEntity, block.timestamp);
      startMatchIfAllRegistered(matchEntity);
      startMatchIfAllReady(matchEntity);
    }
  }
}
