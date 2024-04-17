// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";

import { Player, PlayerReady, Position, PositionData, SpawnPoint, MatchReady, MatchConfig } from "../codegen/index.sol";

import { playerFromAddress } from "../libraries/LibUtils.sol";
import { startMatchIfAllReady } from "../libraries/LibMatch.sol";

contract LobbySystem is System {
  function toggleReady(bytes32 matchEntity) public {
    bytes32 player = playerFromAddress(matchEntity, _msgSender());
    require(Player.get(matchEntity, player) > 0, "you are not registered");

    if (PlayerReady.get(matchEntity, player) == 0) {
      PlayerReady.set(matchEntity, player, block.timestamp);
      startMatchIfAllReady(matchEntity);
    } else {
      // If the player has already readied up, unready them
      PlayerReady.deleteRecord(matchEntity, player);
    }
  }
}
