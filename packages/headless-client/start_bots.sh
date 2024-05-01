#!/bin/bash
set -e

CHAIN_ID="$1"
MATCH_ENTITY="$2"

if [ -z "$CHAIN_ID" ]; then
  echo "chain id is not provided."
  exit 1
fi

if [ -z "$MATCH_ENTITY" ]; then
  echo "Match entity is not provided."
  exit 1
fi

BOT_1_COMMAND="PRIVATE_KEY=0x4697c6103a0e9a79f84ede6adee88a5523f767570e84b9d70764459f77f6a826 CHAIN_ID=$CHAIN_ID MATCH_ENTITY=$MATCH_ENTITY pnpm tsx scripts/createBotPlayer.ts"

BOT_2_COMMAND="PRIVATE_KEY=0x31258a97b375b36f40ed94a3480b81558c4679cd22781d6cfa84589fcf45e657 CHAIN_ID=$CHAIN_ID MATCH_ENTITY=$MATCH_ENTITY pnpm tsx scripts/createBotPlayer.ts"

BOT_3_COMMAND="PRIVATE_KEY=0x43f66bbd2bb30fb343781376f62bb923de38ea029afa54f41cc6b7638f75eee4 CHAIN_ID=$CHAIN_ID MATCH_ENTITY=$MATCH_ENTITY pnpm tsx scripts/createBotPlayer.ts"

BOT_4_COMMAND="PRIVATE_KEY=0x145f111d1bf33784b583db233f130a5a5c2b60053fb8b1be900b4954cbe34f1d CHAIN_ID=$CHAIN_ID MATCH_ENTITY=$MATCH_ENTITY pnpm tsx scripts/createBotPlayer.ts"

pnpm mprocs "$BOT_1_COMMAND" "$BOT_2_COMMAND"