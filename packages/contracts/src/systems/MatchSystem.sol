// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { toSlice, StrCharsIter } from "@dk1a/solidity-stringutils/src/StrSlice.sol";

import { System } from "@latticexyz/world/src/System.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { Admin, Match, MatchName, MatchIndex, MatchSweepstake, LevelTemplatesIndex, LevelInStandardRotation, LevelInSeasonPassRotation, MatchAccessControl, MatchConfig, MatchSky, MatchConfigData, SkyPoolConfig, MatchesPerDay } from "../codegen/index.sol";
import { SpawnSettlementTemplateId } from "../codegen/Templates.sol";

import { addressToEntity, entityToAddress } from "../libraries/LibUtils.sol";
import { DENOMINATOR, createMatchSkyPool, transferTokenFromEscrow, skyKeyHolderOnly } from "../libraries/LibSkyPool.sol";
import { Transactor } from "../libraries/Transactor.sol";
import { transferToken } from "../transferToken.sol";
import { hasSeasonPass, hasToken } from "../hasToken.sol";

function sum(uint256[] memory arr) pure returns (uint256 s) {
  for (uint256 i; i < arr.length; i++) {
    s += arr[i];
  }
}

function getCharLength(string memory str) pure returns (uint256) {
  StrCharsIter memory chars = toSlice(str).chars();
  return chars.count();
}

uint256 constant MATCHES_PER_DAY_HARD_CAP = 1000;

contract MatchSystem is System {
  modifier worldUnlocked() {
    require(!SkyPoolConfig.getLocked(), "world is locked");
    _;
  }

  function _createMatch(
    string memory name,
    bytes32 claimedFirstMatchInWindow,
    bytes32 matchEntity,
    bytes32 levelId,
    uint256 registrationTime
  ) internal {
    require(getCharLength(name) <= 24, "name too long");
    require(MatchConfig.getTurnLength(matchEntity) == 0, "this match already exists");

    uint256 day = block.timestamp / 1 days;
    uint256 matchesToday = MatchesPerDay.get(day);
    require(matchesToday < MATCHES_PER_DAY_HARD_CAP, "too many matches created today");

    MatchesPerDay.set(day, matchesToday + 1);

    bytes32 createdBy = addressToEntity(_msgSender());

    // SkyKey holder does not pay to create matches
    if (!hasToken(SkyPoolConfig.getSkyKeyToken(), _msgSender())) {
      transferToken(_world(), _world(), SkyPoolConfig.getCost());
    }

    Transactor escrowContract = new Transactor(_world());
    address escrowContractAddress = address(escrowContract);

    MatchConfigData memory config = MatchConfigData({
      levelId: levelId,
      startTime: 0,
      turnLength: 15,
      createdBy: createdBy,
      registrationTime: registrationTime,
      escrowContract: escrowContractAddress
    });
    MatchConfig.set(matchEntity, config);
    MatchName.set(matchEntity, name);

    createMatchSkyPool(matchEntity, claimedFirstMatchInWindow);
  }

  function _createMatchSeasonPass(
    string memory name,
    bytes32 claimedFirstMatchInWindow,
    bytes32 matchEntity,
    bytes32 levelId,
    ResourceId systemId,
    uint256 entranceFee,
    uint256[] memory rewardPercentages,
    uint256 registrationTime
  ) internal {
    require(entranceFee == 0 || sum(rewardPercentages) == DENOMINATOR, "percentages must add up to 100");
    require(
      entranceFee == 0 ||
        rewardPercentages.length == LevelTemplatesIndex.length(levelId, SpawnSettlementTemplateId) + 1,
      "there must be percentages for each entity"
    );

    _createMatch(name, claimedFirstMatchInWindow, matchEntity, levelId, registrationTime);
    MatchAccessControl.set(matchEntity, systemId);
    MatchSweepstake.set(matchEntity, entranceFee, rewardPercentages);
  }

  // Create a match with a predefined match entity
  function createMatch(
    string memory name,
    bytes32 claimedFirstMatchInWindow,
    bytes32 matchEntity,
    bytes32 levelId
  ) public worldUnlocked {
    require(
      LevelInStandardRotation.get(levelId) || (hasSeasonPass(_msgSender()) && LevelInSeasonPassRotation.get(levelId)),
      "this level is not in rotation"
    );

    _createMatch(name, claimedFirstMatchInWindow, matchEntity, levelId, 0);
  }

  // Create a match with a predefined match entity, access control system, and sweepstake reward configuration
  function createMatchSeasonPass(
    string memory name,
    bytes32 claimedFirstMatchInWindow,
    bytes32 matchEntity,
    bytes32 levelId,
    ResourceId systemId,
    uint256 entranceFee,
    uint256[] memory rewardPercentages
  ) public worldUnlocked {
    require(hasSeasonPass(_msgSender()), "caller does not have the season pass");
    require(
      LevelInStandardRotation.get(levelId) || LevelInSeasonPassRotation.get(levelId),
      "this level is not in rotation"
    );

    _createMatchSeasonPass(
      name,
      claimedFirstMatchInWindow,
      matchEntity,
      levelId,
      systemId,
      entranceFee,
      rewardPercentages,
      0
    );
  }

  function createMatchSkyKey(
    string memory name,
    bytes32 claimedFirstMatchInWindow,
    bytes32 matchEntity,
    bytes32 levelId,
    ResourceId systemId,
    uint256 entranceFee,
    uint256[] memory rewardPercentages,
    uint256 registrationTime
  ) public worldUnlocked {
    skyKeyHolderOnly(_msgSender());

    _createMatchSeasonPass(
      name,
      claimedFirstMatchInWindow,
      matchEntity,
      levelId,
      systemId,
      entranceFee,
      rewardPercentages,
      registrationTime
    );
  }

  /**
   * Destroying matches in general is a pretty big problem. Especially now that it refunds the creator.
   * This is only here during development to allow us to destroy bugged matches and refund players.
   * Problem 1. Creating a match increments the match index. Destroying a match cannot decrement the match index.
   *         This means that repeatedly creating and destroying matches affects the reward curve. It is a way
   *         to attack the protocol by tanking reward curves without actually playing the game.
   * Problem 2. Destroying a match refunds the creator. SkyKey holder does not pay to create matches.
   *         This means you could create a match as the SkyKey holder, transfer away the SkyKey, and then
   *         destroy it to get a refund, draining the Sky Pool.
   * All in all I don't know if match destruction ever makes sense. It's better if we allow people
   * to modify matches after they've been created instead (also a huge pain, but I think easier to solve).
   */
  function adminDestroyMatch(bytes32 matchEntity) public {
    bytes32 entity = addressToEntity(_msgSender());
    require(Admin.get(entity), "caller is not admin");

    // This leaves extra tokens in the escrow contract that were used for rewards.
    // Punting on this for now, the highest priority is to prevent people from
    // losing tokens when a match gets bugged for some reason.
    bytes32 createdBy = MatchConfig.getCreatedBy(matchEntity);
    Transactor escrowContract = Transactor(MatchConfig.getEscrowContract(matchEntity));
    address createdByAddress = entityToAddress(createdBy);
    transferTokenFromEscrow(address(escrowContract), createdByAddress, SkyPoolConfig.getCost());

    MatchName.deleteRecord(matchEntity);
    MatchIndex.deleteRecord(matchEntity);
    MatchConfig.deleteRecord(matchEntity);
    MatchSky.deleteRecord(matchEntity);
  }
}
