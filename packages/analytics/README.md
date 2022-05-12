# Sky Strife Gameplay Analytics

This package contains a simple node process that listens to a given Sky Strife worlds events, pipes them into `recs`, and periodically outputs them in CSV format.

## Usage

By default, the commands reference the most recently deployed local/testnet worlds by looking at the `deploys` folder in the `contracts` package.

Use `pnpm start:dev` and `pnpm start:testnet` to start the process for the local and testnet worlds respectively.

If you want to pass an arbitrary world/chain, you can use `WORLD_ADDRESS=0x123... CHAIN_ID=123... pnpm start` to start the process for the given world.

## Note on Timing

If this process is running while a match is ongoing, it will accurately generate data around the timing of actions (which block number and turn of the match the action took place on). However, if the process is started after a match has already started, it will not be able to generate accurate timing data for actions that took place before it started listening to the world. In this case, all block numbers/turns will be set to the most recent block number/turn.
