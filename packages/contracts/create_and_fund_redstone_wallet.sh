#!/bin/bash

i=0
filename=".funded_wallets/wallet_$i.txt"
while [ -e "$filename" ]; do
  i=$((i + 1))
  filename=".funded_wallets/wallet_$i.txt"
done

output=$(cast wallet new | awk '/Address:/ {print $2} /Private key:/ {print $3}')
echo "$output" | tee "$filename"
read address private_key <<< "$output"

echo "Address and private key saved to $filename"

pnpm faucet:redstone $address
pnpm faucet:redstone $address