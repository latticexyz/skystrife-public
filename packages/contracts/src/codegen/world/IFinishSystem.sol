// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/* Autogenerated file. Do not edit manually. */

/**
 * @title IFinishSystem
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface IFinishSystem {
  function prependRanking(bytes32 matchEntity, bytes32 entity) external;

  function finish(bytes32 matchEntity, bytes32 loser) external;
}
