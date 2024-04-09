// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";

import { StrChar, toSlice, StrCharsIter, isAscii, StrSlice } from "@dk1a/solidity-stringutils/src/StrSlice.sol";

import { Name, NameExists } from "../codegen/index.sol";
import { addressToEntity } from "../libraries/LibUtils.sol";

function stringEq(string memory a, string memory b) pure returns (bool) {
  if (bytes(a).length != bytes(b).length) {
    return false;
  } else {
    return keccak256(bytes(a)) == keccak256(bytes(b));
  }
}

function isWhitespace(StrChar char) pure returns (bool) {
  bytes1 space = 0x20;
  bytes1 tab = 0x09;
  bytes1 newline = 0x0A;
  bytes1 carriageReturn = 0x0D;
  bytes1 formFeed = 0x0C;
  bytes1 verticalTab = 0x0B;

  bytes1 c = char.toBytes32()[0];

  return c == space || c == tab || c == newline || c == carriageReturn || c == formFeed || c == verticalTab;
}

function getCharLength(StrSlice slice) pure returns (uint256) {
  StrCharsIter memory chars = slice.chars();
  return chars.count();
}

function containsNoWhitespace(StrSlice slice) pure returns (bool) {
  StrCharsIter memory chars = slice.chars();
  while (!chars.isEmpty()) {
    if (isWhitespace(chars.next())) {
      return false;
    }
  }
  return true;
}

function nameIsValid(string memory name) view returns (bool) {
  StrSlice nameSlice = toSlice(name);
  uint256 length = getCharLength(nameSlice);

  return length > 0 && length <= 32 && isAscii(nameSlice) && containsNoWhitespace(nameSlice);
}

/**
 * @dev A name is available if zero entities currently have it
 */
function nameIsAvailable(bytes32 nameBytes) view returns (bool) {
  return NameExists.get(nameBytes) == false;
}

contract NameSystem is System {
  function setName(string memory name) public {
    require(nameIsValid(name), "name is invalid");

    bytes32 nameBytes = bytes32(keccak256(bytes(name)));
    bytes32 entity = addressToEntity(_msgSender());
    string memory currentName = Name.get(entity);

    if (!stringEq(name, currentName)) {
      require(nameIsAvailable(nameBytes), "name already registered");

      bytes32 currentNameBytes = bytes32(keccak256(bytes(currentName)));
      NameExists.set(currentNameBytes, false);

      Name.set(entity, name);
      NameExists.set(nameBytes, true);
    }
  }
}
