import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { TemplatesConfig } from "./templateConfig";
import { StoreConfig } from "@latticexyz/store";

export function renderTemplateIndex(templates: TemplatesConfig<StoreConfig>) {
  return `
  ${renderedSolidityHeader}
  
  ${Object.keys(templates)
    .map((key) => `import {${key}Template, ${key}TemplateId} from "./templates/${key}Template.sol"`)
    .join(";")};
  `;
}
