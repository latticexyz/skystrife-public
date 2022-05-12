/* eslint-disable no-undef */
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["src"],
  moduleNameMapper: {
    "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "setupContracts":
      "<rootDir>/__mocks__/setupContracts.ts",
    "definePhaserConfig":
      "<rootDir>/__mocks__/definePhaserConfig.ts",
    "load":
      "<rootDir>/__mocks__/load.ts",
    "contracts/types/SystemAbis.mjs":
      "<rootDir>/__mocks__/SystemAbis.ts",
  },
  setupFiles: ["jest-canvas-mock"],
};
