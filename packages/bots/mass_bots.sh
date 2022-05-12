#!/bin/bash

# Set the directory path
DIR="../contracts/.funded_wallets"

# Loop through each file in the directory
for FILE in "$DIR"/*
do
  # Extract the second line from the file which is the private key
  PRIVATE_KEY=$(sed -n '2p' "$FILE")
  
  # extract just the filename from $FILE
  FILE=$(basename "$FILE")
  PRIVATE_KEY=$PRIVATE_KEY pnpm create-bot:testnet &> bot_player_output/$FILE &
done
