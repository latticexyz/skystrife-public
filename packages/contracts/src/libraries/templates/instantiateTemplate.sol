// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { EncodedLengths } from "@latticexyz/store/src/EncodedLengths.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { TemplateTables, TemplateContent, TemplateContentData } from "../../codegen/index.sol";

/**
 * Create an instance of `templateId`.
 */
function instantiateTemplate(bytes32 templateId, bytes32[] memory keyTuple) {
  bytes32[] memory tableIds = TemplateTables.get(templateId);

  for (uint256 i; i < tableIds.length; i++) {
    ResourceId resourceId = ResourceId.wrap(tableIds[i]);

    TemplateContentData memory templateContent = TemplateContent.get(templateId, resourceId);
    StoreSwitch.setRecord(
      resourceId,
      keyTuple,
      templateContent.staticData,
      templateContent.encodedLengths,
      templateContent.dynamicData
    );
  }
}
