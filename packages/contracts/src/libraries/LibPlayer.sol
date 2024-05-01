// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Player, Gold, LastAction, OwnedBy, CreatedByAddress, SpawnPoint, MatchPlayer, MatchPlayers } from "../codegen/index.sol";

import { addressToEntity } from "../libraries/LibUtils.sol";
import { createMatchEntity } from "../createMatchEntity.sol";

import { charge } from "../libraries/LibCharge.sol";

int32 constant STARTING_GOLD = 1000;

function createPlayerEntity(bytes32 matchEntity, address playerAddress) returns (bytes32) {
  bytes32 addressEntity = addressToEntity(playerAddress);
  bytes32 playerEntity = createMatchEntity(matchEntity);

  CreatedByAddress.set(matchEntity, playerEntity, addressEntity);
  MatchPlayer.set(matchEntity, playerAddress, playerEntity);
  MatchPlayers.push(matchEntity, playerEntity);

  Player.set(matchEntity, playerEntity, 1);
  Gold.set(matchEntity, playerEntity, STARTING_GOLD);
  LastAction.set(matchEntity, playerEntity, block.timestamp);

  return playerEntity;
}

function spawnPlayer(bytes32 matchEntity, bytes32 player, bytes32 spawnPoint) {
  require(Player.get(matchEntity, player) != 0, "player not created");
  require(SpawnPoint.get(matchEntity, spawnPoint), "not a valid spawn point");
  require(OwnedBy.get(matchEntity, spawnPoint) == 0, "spawn is taken");

  OwnedBy.set(matchEntity, spawnPoint, player);
  LastAction.set(matchEntity, spawnPoint, block.timestamp);

  charge(matchEntity, spawnPoint, player);
}
