# Sky Strife Art

## Prerequisites
If you would like to create/edit Sky Strife maps you will need to install [Tiled](https://www.mapeditor.org/).

If you would like to create/edit Sky Strife sprites you will need to install [Aseprite](https://www.aseprite.org/).

## Package Structure

1. `sprites`: Contains all of the sprites used in Sky Strife. These are converted into a sprite atlas and exported to the `clients` package.
2. `tilesets`: Contains all of the tilesets used in Sky Strife. There are created/edited in Tiled and exported to the `clients` package.
3. `tiled`: Contains Tiled specific files such as the Tiled map files and extensions.
4. `scripts`: Contains scripts used to automate the export of assets to the `clients` package.
5. `aseprite`: Contains Aseprite scripts.

## Exporting Assets

To export sprites and tilesets to Sky Strife, run `pnpm generate`.

## Adding a Sprite

Create your sprite animation and export each frame as a separate `png` file. We suggest using [Aseprite](https://www.aseprite.org/) The folder name should be the name of the animation and each file should be the frame number. This supports nested folders as well. Here is an example of a sprite with two animations, `idle` and `walk`:

```
sprites
├── greyscale
│   ├── archer
│   │   ├── idle
│   │   │   ├── 0.png
│   │   │   ├── 1.png
│   │   │   ├── 2.png
│   │   │   └── 3.png
│   │   └── walk
│   │       ├── 0.png
│   │       ├── 1.png
│   │       ├── 2.png
│   │       └── 3.png
```

## Sprite Coloring

Any images placed in the `greyscale/` folder will have 4 different versions generated of it during the `generate` command. One version for each player color. These are used to color the units during gameplay based on who owns them.

If you do not want the images to be colored, place them in the top level `sprites/` folder instead.