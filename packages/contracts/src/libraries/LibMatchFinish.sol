// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { MatchFinished, MatchRanking, MatchSpawnPoints } from "../codegen/index.sol";

import { dispenseRewards } from "../libraries/LibSkyPool.sol";
import { getOwningPlayer } from "../libraries/LibUtils.sol";

library LibMatchFinish {
  function prependRanking(bytes32 matchEntity, bytes32 entity) public {
    bytes32[] memory newArray = new bytes32[](MatchRanking.length(matchEntity) + 1);
    newArray[0] = entity;

    for (uint256 i; i < MatchRanking.length(matchEntity); i++) {
      newArray[i + 1] = MatchRanking.getItem(matchEntity, i);
    }

    MatchRanking.set(matchEntity, newArray);
  }

  function finish(bytes32 matchEntity, bytes32 loser) public {
    bytes32[] memory spawns = MatchSpawnPoints.get(matchEntity);

    // Find the only remaining spawn
    for (uint256 i; i < spawns.length; i++) {
      bytes32 spawnOwner = getOwningPlayer(matchEntity, spawns[i]);
      if (spawnOwner != 0 && spawnOwner != loser) {
        // Winner is prepended to the ranking here because their spawn was not destroyed
        prependRanking(matchEntity, spawnOwner);
        MatchFinished.set(matchEntity, true);
        dispenseRewards(matchEntity);

        return;
      }
    }
  }
}
