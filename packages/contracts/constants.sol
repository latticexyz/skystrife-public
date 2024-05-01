// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

uint256 constant SEASON_PASS_STARTING_PRICE = 0.03 ether;
uint256 constant SEASON_PASS_MIN_PRICE = 0.03 ether;
uint256 constant SEASON_PASS_PRICE_DECREASE_PER_SECOND = 0;
uint256 constant SEASON_PASS_PRICE_DECREASE_DENOMINATOR = 10_000_000_000;
uint256 constant SEASON_PASS_PURCHASE_MULTIPLIER_PERCENT = 100;
uint256 constant SEASON_START_TIME = 1714579200;
uint256 constant SEASON_PASS_MINT_DURATION = 3 days;
uint256 constant SEASON_DURATION = 30 days;

uint256 constant COST_CREATE_MATCH = 100 ether;
uint256 constant MATCHES_PER_DAY_HARD_CAP = 2000;

uint256 constant WINDOW = 604800; // number of seconds in a week
uint256 constant SKYPOOL_SUPPLY = 100_000_000 ether; // tokens in Sky Pool

uint256 constant SKY_KEY_TOKEN_ID = 0;

bytes14 constant SEASON_PASS_NAMESPACE = "Season1";
string constant SEASON_PASS_SYMBOL = unicode"🎫-1";
string constant SEASON_PASS_NAME = "Season Pass (Season 1)";

bytes14 constant ORB_NAMESPACE = "Orb";
bytes14 constant SKY_KEY_NAMESPACE = "SkyKey";
