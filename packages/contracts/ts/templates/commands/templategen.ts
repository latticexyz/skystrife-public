import path from "path";
import { getSrcDirectory } from "@latticexyz/common/foundry";
import { generateIndex, generateSystem, generateTemplates } from "../templategen";
import config from "../../../mud.config";
import { templates } from "../templates";

const srcDirectory = await getSrcDirectory();
const codegenDirectory = path.join(srcDirectory, config.codegen.outputDirectory);

await generateSystem(templates, codegenDirectory);
await generateIndex(templates, codegenDirectory);
await generateTemplates(templates, codegenDirectory);
