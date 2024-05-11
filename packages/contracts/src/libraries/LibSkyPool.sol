// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { MatchSweepstake, MatchSweepstakeData, MatchConfig, MatchRewardPercentages, MatchIndexToEntity, LastMatchIndex, MatchIndex, MatchRanking, MatchReward, SkyPoolConfig, CreatedByAddress, MatchSky } from "../codegen/index.sol";

import { hasToken } from "../hasToken.sol";
import { entityToAddress, getMatch, getLevelSpawnIndices } from "./LibUtils.sol";
import { Transactor } from "./Transactor.sol";

uint256 constant DENOMINATOR = 100;

function skyKeyHolderOnly(address sender) {
  require(hasToken(SkyPoolConfig.getSkyKeyToken(), sender), "caller does not have the sky key");
}

function transferTokenFromEscrow(address escrowAddress, address to, uint256 value) {
  IERC20 token = IERC20(SkyPoolConfig.getOrbToken());
  Transactor escrowContract = Transactor(escrowAddress);
  (bool success, ) = escrowContract.CALL(address(token), abi.encodeCall(IERC20.transfer, (to, value)), 0);
  require(success, "token transfer from escrow failed");
}

function dispenseRewards(bytes32 matchEntity) {
  bytes32[] memory ranking = MatchRanking.get(matchEntity);

  Transactor escrowContract = Transactor(MatchConfig.getEscrowContract(matchEntity));

  // Send basic rewards to owner of the ranking player entities
  for (uint256 i; i < ranking.length; i++) {
    // Transfer tokens from the world to the owner of the player entity
    bytes32 owner = CreatedByAddress.get(matchEntity, ranking[i]);
    transferTokenFromEscrow(address(escrowContract), entityToAddress(owner), MatchReward.get(matchEntity, i));
  }

  MatchSweepstakeData memory sweepstakeData = MatchSweepstake.get(matchEntity);

  // Send sweepstake rewards
  if (sweepstakeData.entranceFee > 0) {
    uint256 baseReward = sweepstakeData.entranceFee * ranking.length;

    for (uint256 i; i < ranking.length; i++) {
      bytes32 owner = CreatedByAddress.get(matchEntity, ranking[i]);

      if (sweepstakeData.entranceFee > 0) {
        uint256 reward = (sweepstakeData.rewardPercentages[i] * baseReward) / DENOMINATOR;
        transferTokenFromEscrow(address(escrowContract), entityToAddress(owner), reward);
      }
    }

    // Match creator gets the final reward slot
    {
      uint256 reward = (sweepstakeData.rewardPercentages[ranking.length] * baseReward) / DENOMINATOR;
      transferTokenFromEscrow(address(escrowContract), entityToAddress(MatchConfig.getCreatedBy(matchEntity)), reward);
    }
  }
}

// Match reward multiplier is inversely proportional to
// the `numberOfMatches` that took place in the previous X blocks.
function getReward(uint256 numberOfMatches) view returns (uint256) {
  uint256 cost = SkyPoolConfig.getCost();

  if (numberOfMatches < 300) {
    return cost * 3;
  } else if (numberOfMatches < 500) {
    return cost * 2;
  } else if (numberOfMatches < 800) {
    return (cost * 150) / 100;
  } else if (numberOfMatches < 1000) {
    return (cost * 120) / 100;
  } else if (numberOfMatches < 1200) {
    return cost;
  } else if (numberOfMatches < 1400) {
    return (cost * 90) / 100;
  } else if (numberOfMatches < 1700) {
    return (cost * 75) / 100;
  } else if (numberOfMatches < 2000) {
    return (cost * 60) / 100;
  } else {
    return (cost * 50) / 100;
  }
}

function getStartTimeOfWindow(uint256 window) view returns (uint256) {
  uint256 currentTime = block.timestamp;
  uint256 startTime = currentTime > window ? currentTime - window : 0;

  return startTime;
}

function previousMatchIsBeforeTime(uint32 matchIndex, uint256 timestamp) view returns (bool) {
  uint32 previousMatchIndex = matchIndex - 1;
  if (previousMatchIndex == 0) return true;

  bytes32 previousMatchEntity = getMatch(previousMatchIndex);
  uint256 previousMatchCreatedAt = MatchSky.getCreatedAt(previousMatchEntity);

  return previousMatchCreatedAt < timestamp;
}

function getFirstMatchInWindow(bytes32 claimedFirstMatchInWindow) view returns (bool, bytes32) {
  uint256 windowStartTime = getStartTimeOfWindow(SkyPoolConfig.getWindow());
  uint256 matchCreatedAtTime = MatchSky.getCreatedAt(claimedFirstMatchInWindow);

  uint32 matchIndex = MatchIndex.get(claimedFirstMatchInWindow);
  bytes32 firstMatchEntityInWindow = claimedFirstMatchInWindow;

  bool previousMatchOutsideWindow = previousMatchIsBeforeTime(matchIndex, windowStartTime);
  bool matchInsideWindow = matchCreatedAtTime == 0 || matchCreatedAtTime >= windowStartTime;

  if (matchInsideWindow && previousMatchOutsideWindow) {
    return (true, claimedFirstMatchInWindow);
  }

  // we fail here because if we check ahead on a match that is already inside the window
  // we will get a false positive
  if (!previousMatchOutsideWindow && matchInsideWindow) {
    return (false, claimedFirstMatchInWindow);
  }

  // check ahead 3 matches
  for (uint32 i = 1; i < 4; i++) {
    firstMatchEntityInWindow = getMatch(matchIndex + i);
    matchCreatedAtTime = MatchSky.getCreatedAt(firstMatchEntityInWindow);

    if (matchCreatedAtTime >= windowStartTime) {
      return (true, firstMatchEntityInWindow);
    }
  }
}

function createMatchSkyPool(bytes32 matchEntity, bytes32 claimedFirstMatchInWindow) {
  // Fetch the index of the next match to be created
  uint32 matchIndex = LastMatchIndex.get() + 1;
  MatchIndex.set(matchEntity, matchIndex);
  LastMatchIndex.set(matchIndex);

  bytes32 levelId = MatchConfig.getLevelId(matchEntity);

  uint256 numSpawns = getLevelSpawnIndices(levelId).length;
  uint256[] memory matchRewardPercentages = MatchRewardPercentages.get(numSpawns);

  // the first match ever
  bytes32 firstMatchEntityInWindow;
  if (matchIndex == 1) {
    firstMatchEntityInWindow = matchEntity;
  } else {
    // Fetch the closest match in the window
    (bool success, bytes32 foundMatch) = getFirstMatchInWindow(claimedFirstMatchInWindow);
    require(success, "could not find first match in window");

    firstMatchEntityInWindow = foundMatch;
  }

  uint32 earliestMatchIndex = MatchIndex.get(firstMatchEntityInWindow);

  // Calculate the number of matches in the past X blocks by subtracting indices
  uint256 numberOfMatches = uint256(matchIndex - earliestMatchIndex);

  // Calculate the reward based on number of passed matches
  uint256 reward = getReward(numberOfMatches);

  IERC20 token = IERC20(SkyPoolConfig.getOrbToken());
  token.transfer(MatchConfig.getEscrowContract(matchEntity), reward);

  // Set the match info
  MatchSky.set(matchEntity, block.timestamp, reward);

  // Set match rewards for each place
  for (uint256 i; i < matchRewardPercentages.length; i++) {
    uint256 rewardValue = (matchRewardPercentages[i] * reward) / DENOMINATOR;

    MatchReward.set(matchEntity, i, rewardValue);
  }

  // Increment the index
  LastMatchIndex.set(matchIndex);
  MatchIndexToEntity.set(matchIndex, matchEntity);
}
