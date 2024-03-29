// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/* Autogenerated file. Do not edit manually. */

import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { createTemplate } from "../../libraries/templates/createTemplate.sol";
import { UnitTypes, CombatArchetypes, TerrainTypes, StructureTypes, ItemTypes } from "../common.sol";

import { Combat, CombatTableId, UnitType, UnitTypeTableId, StaminaOnKill, StaminaOnKillTableId, Range, RangeTableId, Movable, MovableTableId, Untraversable, UntraversableTableId, Tier, TierTableId } from "../index.sol";

bytes32 constant templateId = "GodUnit";
bytes32 constant GodUnitTemplateId = templateId;
uint256 constant LENGTH = 7;

function GodUnitTemplate() {
  bytes32[] memory tableIds = new bytes32[](LENGTH);
  bytes32[] memory encodedLengthss = new bytes32[](LENGTH);
  bytes[] memory staticDatas = new bytes[](LENGTH);
  bytes[] memory dynamicDatas = new bytes[](LENGTH);

  bytes memory staticData;
  PackedCounter encodedLengths;
  bytes memory dynamicData;

  tableIds[0] = ResourceId.unwrap(CombatTableId);
  tableIds[1] = ResourceId.unwrap(UnitTypeTableId);
  tableIds[2] = ResourceId.unwrap(StaminaOnKillTableId);
  tableIds[3] = ResourceId.unwrap(RangeTableId);
  tableIds[4] = ResourceId.unwrap(MovableTableId);
  tableIds[5] = ResourceId.unwrap(UntraversableTableId);
  tableIds[6] = ResourceId.unwrap(TierTableId);

  (staticData, encodedLengths, dynamicData) = Combat.encode(1000000, 1000000, 0, 300000, 0, 100);
  staticDatas[0] = staticData;
  encodedLengthss[0] = PackedCounter.unwrap(encodedLengths);
  dynamicDatas[0] = dynamicData;

  (staticData, encodedLengths, dynamicData) = UnitType.encode(UnitTypes(uint8(3)));
  staticDatas[1] = staticData;
  encodedLengthss[1] = PackedCounter.unwrap(encodedLengths);
  dynamicDatas[1] = dynamicData;

  (staticData, encodedLengths, dynamicData) = StaminaOnKill.encode(250);
  staticDatas[2] = staticData;
  encodedLengthss[2] = PackedCounter.unwrap(encodedLengths);
  dynamicDatas[2] = dynamicData;

  (staticData, encodedLengths, dynamicData) = Range.encode(0, 1);
  staticDatas[3] = staticData;
  encodedLengthss[3] = PackedCounter.unwrap(encodedLengths);
  dynamicDatas[3] = dynamicData;

  (staticData, encodedLengths, dynamicData) = Movable.encode(6000);
  staticDatas[4] = staticData;
  encodedLengthss[4] = PackedCounter.unwrap(encodedLengths);
  dynamicDatas[4] = dynamicData;

  (staticData, encodedLengths, dynamicData) = Untraversable.encode(true);
  staticDatas[5] = staticData;
  encodedLengthss[5] = PackedCounter.unwrap(encodedLengths);
  dynamicDatas[5] = dynamicData;

  (staticData, encodedLengths, dynamicData) = Tier.encode(3);
  staticDatas[6] = staticData;
  encodedLengthss[6] = PackedCounter.unwrap(encodedLengths);
  dynamicDatas[6] = dynamicData;

  createTemplate(templateId, tableIds, staticDatas, encodedLengthss, dynamicDatas);
}
