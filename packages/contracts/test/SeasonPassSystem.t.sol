// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { SkyStrifeTest, createPublicMatch } from "./SkyStrifeTest.sol";

import { LevelTemplates, LevelTemplatesIndex, OwnedBy, PlayerReady, SpawnPoint, Position, PositionData, Charger, MatchReady, SpawnReservedBy, MatchConfigData, MatchConfig } from "../src/codegen/index.sol";

contract LobbySystemTest is SkyStrifeTest {
  bytes32 player;
  bytes32 player2;

  bytes32 matchEntity;

  bytes32 levelId = "LEVEL";

  // function createNewSeasonPass(
  //   string memory name,
  //   uint256 seasonStart,
  //   uint256 seasonEnd,
  //   uint256 mintEnd,
  //   uint256 priceDecreaseRate,
  //   uint256 startingPrice,
  //   uint256 minPrice,
  //   uint256 buyMultiplier
  // ) public {

  function testCreateNewSeasonPass() public {
    prankAdmin();

    world.createNewSeasonPass(
      "SeasonPass0",
      block.timestamp,
      block.timestamp + 100,
      block.timestamp + 100,
      100,
      100,
      100,
      100
    );
  }
}
