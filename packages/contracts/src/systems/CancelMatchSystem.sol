// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { toSlice, StrCharsIter } from "@dk1a/solidity-stringutils/src/StrSlice.sol";

import { System } from "@latticexyz/world/src/System.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { Admin, Match, MatchName, MatchIndex, MatchStaleTime, MatchSweepstake, LevelTemplatesIndex, LevelInStandardRotation, LevelInSeasonPassRotation, MatchAccessControl, MatchConfig, MatchSky, MatchConfigData, SkyPoolConfig, MatchesPerDay, SeasonPassPrivateMatchLimit, PrivateMatchesCreated, SkyPoolConfig, MatchPlayers, MatchSky } from "../codegen/index.sol";
import { MatchSweepstake, CreatedByAddress, PrivateMatchesCreated } from "../codegen/index.sol";

import { addressToEntity, entityToAddress } from "../libraries/LibUtils.sol";
import { DENOMINATOR, createMatchSkyPool, transferTokenFromEscrow, skyKeyHolderOnly } from "../libraries/LibSkyPool.sol";
import { hasSkyKey } from "../hasToken.sol";

contract CancelMatchSystem is System {
  function cancelMatch(bytes32 matchEntity) public {
    require(MatchConfig.getTurnLength(matchEntity) > 0, "not a valid match");

    uint256 entranceFee = MatchSweepstake.getEntranceFee(matchEntity);
    bytes32 createdBy = MatchConfig.getCreatedBy(matchEntity);

    {
      bool isPrivateMatch = false;
      if (entranceFee > 0) {
        isPrivateMatch = true;
      }

      ResourceId accessControlId = MatchAccessControl.get(matchEntity);
      if (accessControlId.getType() != "" || accessControlId.getResourceName() != "") {
        isPrivateMatch = true;
      }

      if (isPrivateMatch) {
        uint256 privateMatchesCreated = PrivateMatchesCreated.get(
          SkyPoolConfig.getSeasonPassToken(),
          entityToAddress(createdBy)
        );
        if (privateMatchesCreated > 0) {
          PrivateMatchesCreated.set(
            SkyPoolConfig.getSeasonPassToken(),
            entityToAddress(createdBy),
            privateMatchesCreated - 1
          );
        }
      }
    }

    uint256 startTime = MatchConfig.getStartTime(matchEntity);
    require(startTime == 0, "match has already started");

    bytes32 caller = addressToEntity(_msgSender());
    uint256 createdAt = MatchSky.getCreatedAt(matchEntity);

    bool matchIsStale = createdAt < block.timestamp - MatchStaleTime.get();
    require(
      matchIsStale || caller == createdBy || hasSkyKey(_msgSender()),
      "only the creator of a match can cancel it"
    );

    IERC20 orbToken = IERC20(SkyPoolConfig.getOrbToken());
    address escrowAddress = MatchConfig.getEscrowContract(matchEntity);

    // if there is an entrance fee, refund all of the current players in the match
    if (entranceFee > 0) {
      bytes32[] memory players = MatchPlayers.get(matchEntity);

      if (players.length > 0) {
        for (uint256 i = 0; i < players.length; i++) {
          bytes32 player = players[i];
          bytes32 addressEntity = CreatedByAddress.get(matchEntity, player);
          address playerAddress = entityToAddress(addressEntity);
          transferTokenFromEscrow(escrowAddress, playerAddress, entranceFee);
        }
      }
    }

    uint256 creatorRefundAmount = SkyPoolConfig.getCost();
    if (creatorRefundAmount >= 10 && !hasSkyKey(_msgSender())) creatorRefundAmount -= 10 ether;
    if (hasSkyKey(entityToAddress(createdBy))) creatorRefundAmount = 0;

    uint256 escrowBalance = orbToken.balanceOf(escrowAddress);
    if (escrowBalance > 0) {
      if (escrowBalance >= creatorRefundAmount) {
        transferTokenFromEscrow(escrowAddress, entityToAddress(createdBy), creatorRefundAmount);
        // transfer remaining tokens back to pool
        transferTokenFromEscrow(escrowAddress, _world(), orbToken.balanceOf(escrowAddress));
      } else {
        transferTokenFromEscrow(escrowAddress, entityToAddress(createdBy), escrowBalance);
      }
    }

    MatchName.deleteRecord(matchEntity);
    MatchIndex.deleteRecord(matchEntity);
    MatchConfig.deleteRecord(matchEntity);
    MatchSky.deleteRecord(matchEntity);
  }
}
