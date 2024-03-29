// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/* Autogenerated file. Do not edit manually. */

import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { createTemplate } from "../../libraries/templates/createTemplate.sol";
import { UnitTypes, CombatArchetypes, TerrainTypes, StructureTypes, ItemTypes } from "../common.sol";

import { TerrainType, TerrainTypeTableId, MoveDifficulty, MoveDifficultyTableId, ArmorModifier, ArmorModifierTableId } from "../index.sol";

bytes32 constant templateId = "Forest";
bytes32 constant ForestTemplateId = templateId;
uint256 constant LENGTH = 3;

function ForestTemplate() {
  bytes32[] memory tableIds = new bytes32[](LENGTH);
  bytes32[] memory encodedLengthss = new bytes32[](LENGTH);
  bytes[] memory staticDatas = new bytes[](LENGTH);
  bytes[] memory dynamicDatas = new bytes[](LENGTH);

  bytes memory staticData;
  PackedCounter encodedLengths;
  bytes memory dynamicData;

  tableIds[0] = ResourceId.unwrap(TerrainTypeTableId);
  tableIds[1] = ResourceId.unwrap(MoveDifficultyTableId);
  tableIds[2] = ResourceId.unwrap(ArmorModifierTableId);

  (staticData, encodedLengths, dynamicData) = TerrainType.encode(TerrainTypes(uint8(5)));
  staticDatas[0] = staticData;
  encodedLengthss[0] = PackedCounter.unwrap(encodedLengths);
  dynamicDatas[0] = dynamicData;

  (staticData, encodedLengths, dynamicData) = MoveDifficulty.encode(1500);
  staticDatas[1] = staticData;
  encodedLengthss[1] = PackedCounter.unwrap(encodedLengths);
  dynamicDatas[1] = dynamicData;

  (staticData, encodedLengths, dynamicData) = ArmorModifier.encode(-15);
  staticDatas[2] = staticData;
  encodedLengthss[2] = PackedCounter.unwrap(encodedLengths);
  dynamicDatas[2] = dynamicData;

  createTemplate(templateId, tableIds, staticDatas, encodedLengthss, dynamicDatas);
}
