<a href="https://twitter.com/skystrifeHQ">
  <img src="https://img.shields.io/twitter/follow/skystrifeHQ?style=social"/>
</a>
<a href="https://twitter.com/latticexyz">
  <img src="https://img.shields.io/twitter/follow/latticexyz?style=social"/>
</a>

[![discord](https://img.shields.io/badge/join-latticexyz-black?logo=discord&logoColor=white)](https://discord.gg/latticexyz)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

![sky strife cloud background](packages/client/src/public/assets/background.png)

> **Sky Strife** is an onchain RTS game built on the MUD framework.

# Mission

Sky Strife's purpose is to explore the limits of what is possible in an onchain game, with the eventual goal of becoming an [Autonomous World](https://0xparc.org/blog/autonomous-worlds).

# Project Structure

Sky Strife is broken into several sub-packages. Here are the packages that are essential to run the game:

1. `packages/client`: Used to render and play the game in a browser.
2. `packages/contracts`: Contains all of the MUD contracts that make up a single Sky Strife world.
3. `packages/art`: Responsible for storing and exporting assets for Sky Strife. This also includes tooling for the Tiled map editor (map making tilesets, Tiled map files, and a plugin to export maps that are compatible with our template system).
4. `packages/ecs-browser`: Sidebar ECS browser for debugging component state and manually running queries. Used to be part of MUD but was moved back into Sky Strife as MUD development diverged from it.
5. `packages/phaserx`: A wrapper for Phaser 3 that was created at Lattice. Mainly used for strong types and easier setup. Vendored from the official MUD repo as we've made some changes to it.

# Initial Dev Setup

## Prerequisites

`foundry` - Used to run your local node, run tests, and deploy contracts. [Install](https://github.com/foundry-rs/foundry#installation)

## Steps

1. Install latest forge using `foundryup` (see [foundry docs](https://book.getfoundry.sh/getting-started/installation))
2. Run `pnpm` in the base directory to install all dependencies and compile contracts.
3. Run `pnpm dev` to start your local node, deploy contracts, and start the client. You can view the client at `http://localhost:1337/` if you have not changed the default config.

# Using Local MUD

If you want to make live changes to MUD while developing you will have to link the local MUD package to the client and contracts packages.

1. Clone the MUD repo locally.
2. Run `pnpm mud set-version --link <relative_path_to_mud_install>` in your local MUD repo.

# Live Deployment

## Client

The client is deployed automatically when a commit is pushed to any branch. By default `https://playtest.skystrife.xyz` points to the latest `playtest` branch commit. The client is hosted on Cloudflare Pages. See [the github action description](.github/workflows/build-client.yml) for details.

## Contracts

Contract deployment is currently manual.

To deploy to the Sky Strife testnet run `pnpm deploy:redstone-holesky` in `packages/contracts`. After deployment has finished, you'll need to make a commit with the `worlds.json` changes and open a PR to the `develop` branch. The live client uses this to determine which world to connect to.
