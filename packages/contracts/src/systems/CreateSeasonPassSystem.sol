// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IWorld } from "../codegen/world/IWorld.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { BEFORE_CALL_SYSTEM } from "@latticexyz/world/src/systemHookTypes.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { SystemSwitch } from "@latticexyz/world-modules/src/utils/SystemSwitch.sol";

import { IERC721Mintable } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Mintable.sol";
import { ERC721Module } from "@latticexyz/world-modules/src/modules/erc721-puppet/ERC721Module.sol";
import { MODULE_NAMESPACE_ID, ERC721_REGISTRY_TABLE_ID } from "@latticexyz/world-modules/src/modules/erc721-puppet/constants.sol";
import { ERC721MetadataData } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/ERC721Metadata.sol";
import { ERC721Registry } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/ERC721Registry.sol";
import { _erc721SystemId } from "@latticexyz/world-modules/src/modules/erc721-puppet/utils.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { Hook, HookLib } from "@latticexyz/store/src/Hook.sol";
import { SystemHooks } from "@latticexyz/world/src/codegen/tables/SystemHooks.sol";

import { NoTransferHook } from "../NoTransferHook.sol";

import { SeasonPassConfig, SeasonPassLastSaleAt, SkyPoolConfig, SeasonTimes } from "../codegen/index.sol";
import { skyKeyHolderOnly } from "../libraries/LibSkyPool.sol";

contract CreateSeasonPassSystem is System {
  function createNewSeasonPass(
    bytes14 name,
    uint256 seasonStart,
    uint256 seasonEnd,
    uint256 mintEnd,
    uint256 priceDecreaseRate,
    uint256 startingPrice,
    uint256 minPrice,
    uint256 buyMultiplier
  ) public {
    skyKeyHolderOnly(_msgSender());

    deploySeasonPass(name);
    setSeasonPassParams(seasonStart, seasonEnd, mintEnd, priceDecreaseRate, startingPrice, minPrice, buyMultiplier);
  }

  function deploySeasonPass(bytes14 name) internal {
    IWorld world = IWorld(_world());

    IERC721Mintable seasonPass = registerERC721(
      world,
      name,
      ERC721MetadataData({ name: "Season Pass", symbol: unicode"🎫", baseURI: "" })
    );
    SkyPoolConfig.setSeasonPassToken(address(seasonPass));

    // Transfer season pass namespace to World
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(name);
    SystemSwitch.call(abi.encodeCall(world.transferOwnership, (namespaceId, address(this))));

    NoTransferHook hook = new NoTransferHook();
    SystemHooks.push(_erc721SystemId(name), Hook.unwrap(HookLib.encode(address(hook), BEFORE_CALL_SYSTEM)));
  }

  function setSeasonPassParams(
    uint256 seasonStart,
    uint256 seasonEnd,
    uint256 mintEnd,
    uint256 priceDecreaseRate,
    uint256 startingPrice,
    uint256 minPrice,
    uint256 buyMultiplier
  ) internal {
    SeasonTimes.setSeasonStart(seasonStart);
    SeasonTimes.setSeasonEnd(seasonEnd);
    SeasonPassLastSaleAt.set(seasonStart);
    SeasonPassConfig.setMintCutoff(mintEnd);

    // pricing details
    SeasonPassConfig.setRate(priceDecreaseRate);
    SeasonPassConfig.setStartingPrice(startingPrice);
    SeasonPassConfig.setMinPrice(minPrice);
    SeasonPassConfig.setMultiplier(buyMultiplier);
  }

  function registerERC721(
    IWorld world,
    bytes14 namespace,
    ERC721MetadataData memory metadata
  ) internal returns (IERC721Mintable token) {
    // Get the ERC721 module
    ERC721Module erc721Module = ERC721Module(NamespaceOwner.get(MODULE_NAMESPACE_ID));

    // Install the ERC721 module with the provided args
    SystemSwitch.call(abi.encodeCall(world.installModule, (erc721Module, abi.encode(namespace, metadata))));

    // Return the newly created ERC721 token
    token = IERC721Mintable(
      ERC721Registry.get(ERC721_REGISTRY_TABLE_ID, WorldResourceIdLib.encodeNamespace(namespace))
    );
  }
}
