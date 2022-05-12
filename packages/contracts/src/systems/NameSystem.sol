// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { getKeysWithValue } from "@latticexyz/world-modules/src/modules/keyswithvalue/getKeysWithValue.sol";

import { Name, NameTableId } from "../codegen/index.sol";
import { addressToEntity } from "../libraries/LibUtils.sol";

function stringEq(string memory a, string memory b) pure returns (bool) {
  if (bytes(a).length != bytes(b).length) {
    return false;
  } else {
    return keccak256(bytes(a)) == keccak256(bytes(b));
  }
}

/**
 * @dev A name is available if zero entities currently have it
 */
function nameIsAvailable(string memory name) view returns (bool) {
  (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) = Name.encode(name);
  // TODO: replace with a simpler look up
  return getKeysWithValue(NameTableId, staticData, encodedLengths, dynamicData).length == 0;
}

contract NameSystem is System {
  function setName(string memory name) public {
    bytes32 entity = addressToEntity(_msgSender());

    if (!stringEq(name, Name.get(entity))) {
      require(nameIsAvailable(name), "name already registered");
      Name.set(entity, name);
    }
  }
}
