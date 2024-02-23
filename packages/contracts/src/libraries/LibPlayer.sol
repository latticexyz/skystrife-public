// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { IWorld } from "../codegen/world/IWorld.sol";

import { Player, Stamina, LastAction, OwnedBy, SpawnPoint, Match, MatchPlayer, MatchPlayers } from "../codegen/index.sol";

import { addressToEntity } from "../libraries/LibUtils.sol";
import { createMatchEntity } from "../createMatchEntity.sol";

import { charge } from "../libraries/LibCharge.sol";

int32 constant STARTING_GOLD = 250;

function createPlayerEntity(bytes32 matchEntity, address playerAddress) returns (bytes32) {
  bytes32 addressEntity = addressToEntity(playerAddress);
  bytes32 playerEntity = createMatchEntity(matchEntity);

  MatchPlayer.set(matchEntity, playerAddress, playerEntity);
  MatchPlayers.push(matchEntity, playerEntity);

  OwnedBy.set(matchEntity, playerEntity, addressEntity);
  Player.set(matchEntity, playerEntity, 1);
  Stamina.set(matchEntity, playerEntity, STARTING_GOLD);
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
