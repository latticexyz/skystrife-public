// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { EncodedLengths } from "@latticexyz/store/src/EncodedLengths.sol";

import { TemplateTables, TemplateContent } from "../../codegen/index.sol";

/**
 * Create a template.
 */
function createTemplate(
  bytes32 templateId,
  bytes32[] memory tableIds,
  bytes[] memory staticDatas,
  bytes32[] memory encodedLengthss,
  bytes[] memory dynamicDatas
) {
  TemplateTables.set(templateId, tableIds);

  for (uint256 i; i < tableIds.length; i++) {
    TemplateContent.set(
      templateId,
      ResourceId.wrap(tableIds[i]),
      EncodedLengths.wrap(encodedLengthss[i]),
      staticDatas[i],
      dynamicDatas[i]
    );
  }
}
