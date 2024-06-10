// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";

import { MatchConfig, Player, SpawnReservedBy, Position, PositionData, MatchSpawnPoints, MatchPlayer, MatchPlayers, OwnedBy, PlayerReady, CreatedByAddress } from "../codegen/index.sol";
import { MatchSweepstake, LevelPosition, LevelPositionData } from "../codegen/index.sol";

import { transferTokenFromEscrow } from "../libraries/LibSkyPool.sol";
import { LibCombat } from "base/libraries/LibCombat.sol";
import { uncharge } from "../libraries/LibCharge.sol";

contract PlayerDeregisterSystem is System {
  function deregister(bytes32 matchEntity, uint256 spawnIndex, bytes32 heroEntity) public returns (bytes32) {
    require(MatchConfig.getStartTime(matchEntity) == 0, "match already started");

    bytes32 player = MatchPlayer.get(matchEntity, _msgSender());
    require(player != 0, "sender is not registered for this match");

    bytes32[] memory matchPlayers = MatchPlayers.get(matchEntity);
    // remove current player from MatchPlayers
    for (uint256 i = 0; i < matchPlayers.length; i++) {
      bytes32 matchPlayer = matchPlayers[i];
      if (player == matchPlayer) {
        matchPlayers[i] = matchPlayers[matchPlayers.length - 1];
        MatchPlayers.pop(matchEntity);
        break;
      }
    }

    require(SpawnReservedBy.get(matchEntity, spawnIndex) == player, "invalid spawn index");
    bytes32 levelId = MatchConfig.getLevelId(matchEntity);
    LevelPositionData memory levelPositionData = LevelPosition.get(levelId, spawnIndex);
    bytes32[] memory spawnPoints = MatchSpawnPoints.get(matchEntity);
    bytes32 playerSpawn;
    for (uint256 i = 0; i < spawnPoints.length; i++) {
      bytes32 spawnPoint = spawnPoints[i];
      PositionData memory position = Position.get(matchEntity, spawnPoint);

      if (position.x == levelPositionData.x && position.y == levelPositionData.y) {
        playerSpawn = spawnPoint;
        break;
      }
    }
    require(playerSpawn != bytes32(0), "player spawn not found");

    uncharge(matchEntity, playerSpawn, player);
    LibCombat.kill(matchEntity, playerSpawn);
    for (uint256 i = 0; i < spawnPoints.length; i++) {
      bytes32 matchSpawn = spawnPoints[i];
      if (matchSpawn == playerSpawn) {
        spawnPoints[i] = spawnPoints[spawnPoints.length - 1];
        MatchSpawnPoints.pop(matchEntity);
        break;
      }
    }

    bytes32 heroOwner = OwnedBy.get(matchEntity, heroEntity);
    require(heroOwner == player, "hero owner mismatch");

    LibCombat.kill(matchEntity, heroEntity);

    uint256 entranceFee = MatchSweepstake.getEntranceFee(matchEntity);
    if (entranceFee > 0) {
      address escrowAddress = MatchConfig.getEscrowContract(matchEntity);
      transferTokenFromEscrow(escrowAddress, _msgSender(), entranceFee);
    }

    MatchPlayer.deleteRecord(matchEntity, _msgSender());
    SpawnReservedBy.deleteRecord(matchEntity, spawnIndex);
    CreatedByAddress.deleteRecord(matchEntity, player);
    PlayerReady.deleteRecord(matchEntity, player);
    Player.deleteRecord(matchEntity, player);
  }
}
