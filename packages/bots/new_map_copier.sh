#!/bin/bash

cd ../contracts/
PRIVATE_KEY=$(pnpm new-redstone-wallet | sed -n "6p")

echo $PRIVATE_KEY

cd ../bots/
PRIVATE_KEY=$PRIVATE_KEY pnpm copy-maps:redstone &> /dev/null &
