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

- `packages/client`: Used to render and play the game in a browser.
- `packages/contracts`: Contains all of the MUD contracts that make up a single Sky Strife world.
- `packages/art`: Responsible for storing and exporting assets for Sky Strife. This also includes tooling for the Tiled map editor (map making tilesets, Tiled map files, and a plugin to export maps that are compatible with our template system).
- `packages/ecs-browser`: Sidebar ECS browser for debugging component state and manually running queries. Used to be part of MUD but was moved back into Sky Strife as MUD development diverged from it.
- `packages/phaserx`: A wrapper for Phaser 3 that was created at Lattice. Mainly used for strong types and easier setup. Vendored from the official MUD repo as we've made some changes to it.

# Dev Setup

## Prerequisites

- `node` - Version 18.16.1 or greater
- `foundry` - Used to run your local node, run tests, and deploy contracts. [Install](https://github.com/foundry-rs/foundry#installation)

  > There is currently an issue with the latest version of Foundry which causes Sky Strife deployment to fail. Please revert back to an old version using this command `foundryup -C 375df5834d0fea8350a4aae9ca34a0dab55d74ac`

## Steps

1. Install the latest forge using `foundryup` (see [Foundry docs](https://book.getfoundry.sh/getting-started/installation)) and then revert to an older version that is known to work.

   Note that this is a slow process because it is necessary to compile Foundry from the source code.

   ```sh copy
   foundryup -C 375df5834d0fea8350a4aae9ca34a0dab55d74ac
   ```

   If necessary, you can update to a new version of [Rust](https://doc.rust-lang.org/book/ch01-01-installation.html).

   ```sh copy
   rustup update
   ```

2. Clone the repository, install the dependencies, and compile the contract.

   ```sh copy
   git clone https://github.com/latticexyz/skystrife-public.git
   cd skystrife-public
   pnpm install
   cd packages/contracts
   pnpm build
   cd ../..
   ```

3. Start your local node, deploy contracts, and start the client.

   ```sh copy
   pnpm dev
   ```

4. Browse to [`http://localhost:1337`](http://localhost:1337) to view the client.

   If you get an error saying `The connected Sky Strife world is not valid.`, wait about a minute and reload.
   It takes some time for the contracts to build and deploy.

   You should automatically be connected as the admin of the world.

## Test Matches

If you are okay with playing alone with no win condition, the standard dev setup will spawn test matches for you on a debugging map.

If you want to play against an opponent (yourself), these are the steps:

1. Browse to [`http://localhost:1337`](http://localhost:1337) to view the client as an administrator.
1. Press **PLAY** and then **SKIP**.
1. Click **+ CREATE MATCH**.
1. Enter a match name, select a map (preferable for 2 players, easier to test), and then scroll down and click **CREATE AND JOIN MATCH**.
1. Select a hero and click **CREATE AND JOIN MATCH**.
1. Click **PLAY**.

To join as another player:

1. Browse to [`http://localhost:1337/?asPlayer`](http://localhost:1337/?asPlayer) as a normal user.
1. Click **PLAY** and then **SKIP**.
1. Click **OPEN** in the row for your match, and then join normally.

You can join a match as the administrator, a regular user, and another regular user in an incognito window.
If you need to be more, you can use different [browser profiles](https://support.google.com/chrome/answer/2364824?hl=en&co=GENIE.Platform%3DDesktop) or different browsers.

# Using Local MUD

If you want to make live changes to MUD while developing you will have to link the local MUD package to the client and contracts packages.

1. Clone the MUD repo locally.
2. Run `pnpm mud set-version --link <relative_path_to_mud_install>` in your local MUD repo.

# Live Deployment

## Client

The client is deployed automatically when a commit is pushed to any branch. By default `https://playtest.skystrife.xyz` points to the latest `playtest` branch commit. The client is hosted on Cloudflare Pages. See [the github action description](.github/workflows/build-client.yml) for details.

## Contracts

Contract deployment is currently manual.

To deploy to the Sky Strife testnet run `pnpm deploy:garnet` in `packages/contracts`. After deployment has finished, you'll need to make a commit with the `worlds.json` changes and open a PR to the `develop` branch. The live client uses this to determine which world to connect to.
