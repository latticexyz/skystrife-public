import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { TemplateConfig } from "./templateConfig";
import { World } from "@latticexyz/world";
import config from "../../mud.config";

const formatValue = (config: World, fieldType: string, value: number | string) => {
  if (fieldType in config.enums) {
    return `${fieldType}(uint8(${value}))`;
  } else if (typeof value === "string" && value.includes("0x")) {
    return `${value}`;
  } else if (fieldType.includes("bytes")) {
    return `"${value}"`;
  }
  return `${value}`;
};

export const renderSetRecord = (config: World, tableName: string, value: { [k: string]: number }, i: number) => {
  const tableConfig = config.tables[tableName];
  const { schema, key } = tableConfig;

  const valueFieldNames = Object.keys(schema).filter((fieldName) => !key.includes(fieldName));

  // Iterate through the keys in the original schema to preserve ordering
  const formattedValues = valueFieldNames.map((fieldName) => {
    const fieldValue = value[fieldName];

    const variableName = `${tableName.toLowerCase()}_${fieldName}`;
    const { internalType: fieldType } = schema[fieldName];
    const isArray = Array.isArray(fieldValue);

    if (isArray) {
      const declaration = `${fieldType} memory ${variableName} = new ${fieldType}(${fieldValue.length})`;
      const assignments = fieldValue.map((v, i) => `${variableName}[${i}] = ${formatValue(config, fieldType, v)}`);

      return {
        declaration: [declaration, ...assignments].join(";"),
        name: variableName,
        formattedValue: null,
      };
    }

    return {
      declaration: null,
      name: null,
      formattedValue: formatValue(config, fieldType, fieldValue),
    };
  });

  return `${formattedValues.find((v) => v.declaration) ? formattedValues.map((v) => v.declaration).join(";") + ";" : ""}
  (staticData, encodedLengths, dynamicData) = ${tableName}.encode(${formattedValues
    .map((v) => (v.name ? v.name : v.formattedValue))
    .join(",")});
  staticDatas[${i}] = staticData;
  encodedLengthss[${i}] = EncodedLengths.unwrap(encodedLengths);
  dynamicDatas[${i}] = dynamicData;
      `;
};

export function renderTemplate(name: string, values: TemplateConfig<World>) {
  return `
  ${renderedSolidityHeader}
  
  import { EncodedLengths } from "@latticexyz/store/src/EncodedLengths.sol";
  import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
  import { createTemplate } from "base/libraries/templates/createTemplate.sol";
  ${
    Object.keys(config.enums).length > 0
      ? `import { ${Object.keys(config.enums)
          .map((e) => e)
          .join(",")} } from "base/codegen/common.sol";`
      : ""
  }

  ${
    Object.keys(values).length > 0
      ? `import {${Object.keys(values)
          .map((key) => `${key}`)
          .join(",")}} from "base/codegen/index.sol";`
      : ""
  }
  
  bytes32 constant templateId = "${name}";
  bytes32 constant ${name}TemplateId = templateId;
  uint256 constant LENGTH = ${Object.keys(values).length};

  function ${name}Template() {
    bytes32[] memory tableIds = new bytes32[](LENGTH);
    bytes32[] memory encodedLengthss = new bytes32[](LENGTH);
    bytes[] memory staticDatas = new bytes[](LENGTH);
    bytes[] memory dynamicDatas = new bytes[](LENGTH);

    bytes memory staticData; 
    EncodedLengths encodedLengths; 
    bytes memory dynamicData;

    ${Object.keys(values)
      .map((key, i) => `tableIds[${i}] = ResourceId.unwrap(${key}._tableId)`)
      .join(";")};

    ${Object.entries(values)
      .map(([tableName, value], i) => (value ? renderSetRecord(config, tableName, value, i) : ""))
      .join("")}

    createTemplate(templateId, tableIds, staticDatas, encodedLengthss, dynamicDatas);
  }
`;
}
