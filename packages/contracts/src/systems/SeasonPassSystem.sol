// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { IERC721Mintable } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Mintable.sol";

import { SeasonPassIndex, SeasonPassConfig, SeasonPassLastSaleAt, SkyPoolConfig, SeasonPassSale } from "../codegen/index.sol";

import { hasSeasonPass } from "../hasToken.sol";
import { DENOMINATOR } from "../libraries/LibSkyPool.sol";
import { SEASON_PASS_PRICE_DECREASE_DENOMINATOR } from "../../script/PostDeploy.s.sol";

uint256 constant MAX_TOKEN_ID = 10_000_000;

// The price lazily decreases based on how much time has passed.
// eg. if the starting price is 1000, and 50 seconds have passed, the actual price is now 950.
function calculateCurrentPrice() view returns (uint256 price) {
  uint256 startingPrice = SeasonPassConfig.getStartingPrice();
  uint256 minPrice = SeasonPassConfig.getMinPrice();
  uint256 rate = SeasonPassConfig.getRate();

  if (rate == 0) {
    return startingPrice;
  }

  uint256 lastSaleAt = SeasonPassLastSaleAt.get();
  // This cannot overflow because block.timestamp is always ahead of last sale
  uint256 timeSinceLastSale = block.timestamp - lastSaleAt;
  uint256 difference = ((startingPrice * rate) / SEASON_PASS_PRICE_DECREASE_DENOMINATOR) * timeSinceLastSale;

  // Avoid integer underflow
  if (startingPrice > difference) {
    price = startingPrice - difference;
    // Price cannot go below minimum price
    if (price < minPrice) {
      price = minPrice;
    }
  } else {
    price = minPrice;
  }
}

contract SeasonPassSystem is System {
  modifier worldUnlocked() {
    require(!SkyPoolConfig.getLocked(), "world is locked");
    _;
  }

  function buySeasonPass(address account) public payable worldUnlocked {
    require(!hasSeasonPass(account), "this account already has a season pass");
    require(block.timestamp < SeasonPassConfig.getMintCutoff(), "season pass minting has ended");

    uint256 price = calculateCurrentPrice();
    require(_msgValue() >= price, "you must pay enough");

    uint256 tokenId = SeasonPassIndex.get();
    require(tokenId < MAX_TOKEN_ID, "all season passes have been minted");

    // Mint season pass
    IERC721Mintable token = IERC721Mintable(SkyPoolConfig.getSeasonPassToken());
    token.mint(account, tokenId);

    // Purely for analytics
    SeasonPassSale.set(account, tokenId, price, block.timestamp, address(token));

    // Update auction data
    SeasonPassIndex.set(tokenId + 1);
    SeasonPassLastSaleAt.set(block.timestamp);

    uint256 multiplier = SeasonPassConfig.getMultiplier();
    uint256 newStartingPrice = (price * multiplier) / DENOMINATOR;
    SeasonPassConfig.setStartingPrice(newStartingPrice);

    uint256 refundAmount = _msgValue() - price;
    if (refundAmount > 0) {
      (bool sent, bytes memory data) = _msgSender().call{ value: refundAmount }("");
      require(sent, "failed to send refund");
    }
  }
}
