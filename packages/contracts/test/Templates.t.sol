// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { SkyStrifeTest } from "./SkyStrifeTest.sol";

import { Factory } from "../src/codegen/index.sol";
import { SettlementTemplate, SettlementTemplateId } from "../src/codegen/Templates.sol";
import { createTemplates } from "../src/codegen/scripts/CreateTemplates.sol";

import { entityToKeyTuple } from "../src/libraries/LibUtils.sol";
import { instantiateTemplate } from "../src/libraries/templates/instantiateTemplate.sol";
import { createMatchEntity } from "../src/createMatchEntity.sol";

contract TemplateTest is SkyStrifeTest, GasReporter {
  function testTemplates() public {
    prankAdmin();

    // Create templates
    startGasReport("Creating settlement template");
    SettlementTemplate();
    endGasReport();

    bytes32 instance = createMatchEntity(testMatch);

    startGasReport("Instantiating settlement template");
    instantiateTemplate(SettlementTemplateId, entityToKeyTuple(testMatch, instance));
    endGasReport();

    bytes32[] memory prototypeIds = Factory.getPrototypeIds(testMatch, instance);
    bytes32 swordsmanId = prototypeIds[0];
    bytes32 prototypeId = "Swordsman";

    assertEq(swordsmanId, prototypeId, "did not correctly set prototype id");
  }
}
