#!/bin/bash

cd ../contracts/
PRIVATE_KEY=$(pnpm new-testnet-wallet | sed -n "6p")

echo $PRIVATE_KEY

cd ../bots/
PRIVATE_KEY=$PRIVATE_KEY pnpm create-matches:testnet &