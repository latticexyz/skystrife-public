// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { toSlice, StrCharsIter } from "@dk1a/solidity-stringutils/src/StrSlice.sol";

import { System } from "@latticexyz/world/src/System.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { Admin, Match, MatchName, MatchIndex, MatchSweepstake, LevelTemplatesIndex, LevelInStandardRotation, LevelInSeasonPassRotation } from "../codegen/index.sol";
import { MatchAccessControl, MatchConfig, MatchSky, MatchConfigData, SkyPoolConfig, MatchesPerDay, SeasonPassPrivateMatchLimit, PrivateMatchesCreated, SeasonTimes, PracticeMatch } from "../codegen/index.sol";
import { SpawnSettlementTemplateId } from "../codegen/Templates.sol";

import { addressToEntity, entityToAddress } from "../libraries/LibUtils.sol";
import { DENOMINATOR, createMatchSkyPool, transferTokenFromEscrow, skyKeyHolderOnly } from "../libraries/LibSkyPool.sol";
import { Transactor } from "../libraries/Transactor.sol";
import { transferToken } from "../transferToken.sol";
import { hasSeasonPass, hasToken, hasSkyKey } from "../hasToken.sol";
import { MATCHES_PER_DAY_HARD_CAP } from "../../constants.sol";

function sum(uint256[] memory arr) pure returns (uint256 s) {
  for (uint256 i; i < arr.length; i++) {
    s += arr[i];
  }
}

function getCharLength(string memory str) pure returns (uint256) {
  StrCharsIter memory chars = toSlice(str).chars();
  return chars.count();
}

contract MatchSystem is System {
  modifier seasonActive() {
    require(
      block.timestamp >= SeasonTimes.getSeasonStart() && block.timestamp <= SeasonTimes.getSeasonEnd(),
      "no season active"
    );
    _;
  }

  function _createMatch(
    string memory name,
    bytes32 claimedFirstMatchInWindow,
    bytes32 matchEntity,
    bytes32 levelId,
    uint256 registrationTime,
    bool isPractice
  ) internal {
    require(getCharLength(name) <= 24, "name too long");
    require(MatchConfig.getTurnLength(matchEntity) == 0, "this match already exists");

    uint256 day = block.timestamp / 1 days;
    uint256 matchesToday = MatchesPerDay.get(day);
    require(matchesToday < MATCHES_PER_DAY_HARD_CAP, "too many matches created today");

    MatchesPerDay.set(day, matchesToday + 1);

    bytes32 createdBy = addressToEntity(_msgSender());

    // SkyKey holder does not pay to create matches
    if (!isPractice && !hasToken(SkyPoolConfig.getSkyKeyToken(), _msgSender())) {
      transferToken(_world(), _world(), SkyPoolConfig.getCost());
    }

    if (isPractice) {
      PracticeMatch.set(matchEntity, true);
      transferToken(_world(), _world(), 5 ether);
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

    if (!isPractice) {
      createMatchSkyPool(matchEntity, claimedFirstMatchInWindow);
    } else {
      MatchSky.setCreatedAt(matchEntity, block.timestamp);
      MatchSky.setReward(matchEntity, 0);
    }
  }

  function _createMatchSeasonPass(
    string memory name,
    bytes32 claimedFirstMatchInWindow,
    bytes32 matchEntity,
    bytes32 levelId,
    ResourceId systemId,
    uint256 entranceFee,
    uint256[] memory rewardPercentages,
    uint256 registrationTime,
    bool isPractice
  ) internal {
    require(entranceFee == 0 || sum(rewardPercentages) == DENOMINATOR, "percentages must add up to 100");
    require(
      entranceFee == 0 ||
        rewardPercentages.length == LevelTemplatesIndex.length(levelId, SpawnSettlementTemplateId) + 1,
      "there must be percentages for each entity"
    );

    _createMatch(name, claimedFirstMatchInWindow, matchEntity, levelId, registrationTime, isPractice);
    MatchAccessControl.set(matchEntity, systemId);
    MatchSweepstake.set(matchEntity, entranceFee, rewardPercentages);
  }

  // Create a match with a predefined match entity
  function createMatch(
    string memory name,
    bytes32 claimedFirstMatchInWindow,
    bytes32 matchEntity,
    bytes32 levelId,
    bool isPractice
  ) public seasonActive {
    require(
      LevelInStandardRotation.get(levelId) || (hasSeasonPass(_msgSender()) && LevelInSeasonPassRotation.get(levelId)),
      "this level is not in rotation"
    );

    _createMatch(name, claimedFirstMatchInWindow, matchEntity, levelId, 0, isPractice);
  }

  // Create a match with a predefined match entity, access control system, and sweepstake reward configuration
  function createMatchSeasonPass(
    string memory name,
    bytes32 claimedFirstMatchInWindow,
    bytes32 matchEntity,
    bytes32 levelId,
    ResourceId systemId,
    uint256 entranceFee,
    uint256[] memory rewardPercentages,
    bool isPractice
  ) public seasonActive {
    address caller = _msgSender();
    require(hasSeasonPass(caller), "caller does not have the season pass");

    // creating private match...
    if (!isPractice && (systemId.getType() != "" || systemId.getResourceName() != "" || entranceFee != 0)) {
      address seasonPassToken = SkyPoolConfig.getSeasonPassToken();
      uint256 privateMatchLimit = SeasonPassPrivateMatchLimit.get();
      uint256 privateMatchesCreated = PrivateMatchesCreated.get(seasonPassToken, caller);
      require(privateMatchesCreated < privateMatchLimit, "private match limit reached");

      PrivateMatchesCreated.set(seasonPassToken, caller, privateMatchesCreated + 1);
    }

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
      0,
      isPractice
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
    uint256 registrationTime,
    bool isPractice
  ) public seasonActive {
    skyKeyHolderOnly(_msgSender());

    _createMatchSeasonPass(
      name,
      claimedFirstMatchInWindow,
      matchEntity,
      levelId,
      systemId,
      entranceFee,
      rewardPercentages,
      registrationTime,
      isPractice
    );
  }
}
