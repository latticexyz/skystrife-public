// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { TemplateTables, TemplateContent } from "../../codegen/index.sol";

/**
 * Create an instance of `templateId`.
 */
function instantiateTemplate(bytes32 templateId, bytes32[] memory keyTuple) {
  bytes32[] memory tableIds = TemplateTables.get(templateId);

  for (uint256 i; i < tableIds.length; i++) {
    ResourceId resourceId = ResourceId.wrap(tableIds[i]);

    (PackedCounter encodedLengths, bytes memory staticData, bytes memory dynamicData) = TemplateContent.get(
      templateId,
      resourceId
    );

    StoreSwitch.setRecord(resourceId, keyTuple, staticData, encodedLengths, dynamicData);
  }
}
