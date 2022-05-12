// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { toSlice, StrCharsIter } from "@dk1a/solidity-stringutils/src/StrSlice.sol";

import { System } from "@latticexyz/world/src/System.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { Admin, Match, MatchName, MatchIndex, MatchSweepstake, LevelTemplatesIndex, LevelInStandardRotation, LevelInSeasonPassRotation, MatchAccessControl, MatchConfig, MatchSky, MatchConfigData, SkyPoolConfig } from "../codegen/index.sol";
import { SpawnSettlementTemplateId } from "../codegen/Templates.sol";

import { addressToEntity } from "../libraries/LibUtils.sol";
import { DENOMINATOR, createMatchSkyPool } from "../libraries/LibSkyPool.sol";
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

contract MatchSystem is System {
  function _createMatch(
    string memory name,
    bytes32 claimedFirstMatchInWindow,
    bytes32 matchEntity,
    bytes32 levelId,
    uint256 registrationTime
  ) internal {
    require(getCharLength(name) <= 24, "name too long");
    require(MatchConfig.getTurnLength(matchEntity) == 0, "this match already exists");

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
  ) public {
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
  ) public {
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
  ) public {
    require(hasToken(SkyPoolConfig.getSkyKeyToken(), _msgSender()), "caller does not have the sky key");

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

  function adminDestroyMatch(bytes32 matchEntity) public {
    bytes32 entity = addressToEntity(_msgSender());
    require(Admin.get(entity), "caller is not admin");

    MatchName.deleteRecord(matchEntity);
    MatchIndex.deleteRecord(matchEntity);
    MatchConfig.deleteRecord(matchEntity);
    MatchSky.deleteRecord(matchEntity);
  }
}
