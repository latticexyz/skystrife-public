import path from "path";
import { formatAndWriteSolidity } from "@latticexyz/common/codegen";
import { renderTemplateIndex } from "./renderTemplateIndex";
import { renderTemplateScript } from "./renderTemplateScript";
import { renderTemplate } from "./renderTemplate";
import { StoreConfig } from "@latticexyz/store";
import { TemplatesConfig } from "./templateConfig";

export const generateIndex = async (templates: TemplatesConfig<StoreConfig>, outputBaseDirectory: string) => {
  const output = renderTemplateIndex(templates);
  const fullOutputPath = path.join(outputBaseDirectory, `Templates.sol`);

  await formatAndWriteSolidity(output, fullOutputPath, "Generated index");
};

export const generateSystem = async (templates: TemplatesConfig<StoreConfig>, outputBaseDirectory: string) => {
  const output = renderTemplateScript(templates);

  const fullOutputPath = path.join(outputBaseDirectory, `scripts/CreateTemplates.sol`);
  await formatAndWriteSolidity(output, fullOutputPath, "Generated system");
};

export const generateTemplates = async (templates: TemplatesConfig<StoreConfig>, outputBaseDirectory: string) => {
  for (const name of Object.keys(templates)) {
    const output = renderTemplate(name, templates[name]);
    const fullOutputPath = path.join(outputBaseDirectory, `templates/${name}Template.sol`);

    try {
      await formatAndWriteSolidity(output, fullOutputPath, "Generated template");
    } catch (e) {
      console.error(
        output
          .split("\n")
          .map((line, i) => `${i + 1}: ${line}`)
          .join("\n"),
      );
      console.log(e);
    }
  }
};
