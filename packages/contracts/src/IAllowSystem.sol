// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

interface IAllowSystem {
  function isAllowed(bytes32 matchEntity, address account) external view returns (bool);
}
