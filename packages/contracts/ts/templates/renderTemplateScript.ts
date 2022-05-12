import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { TemplatesConfig } from "./templateConfig";
import { StoreConfig } from "@latticexyz/store";

export function renderTemplateScript(templateConfig: TemplatesConfig<StoreConfig>) {
  return `
  ${renderedSolidityHeader}
  
  import {${Object.keys(templateConfig)
    .map((key) => `${key}Template`)
    .join(",")}} from "../Templates.sol";

  function createTemplates() {
    ${Object.keys(templateConfig)
      .map((key) => `${key}Template()`)
      .join(";")};
  }`;
}
