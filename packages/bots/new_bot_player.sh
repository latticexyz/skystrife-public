#!/bin/bash

cd ../contracts/
PRIVATE_KEY=$(pnpm new-testnet-wallet | sed -n "6p")

echo $PRIVATE_KEY

cd ../bots/
touch bot_player_output/$PRIVATE_KEY.txt
PRIVATE_KEY=$PRIVATE_KEY pnpm create-bot:testnet &> bot_player_output/$PRIVATE_KEY.txt &