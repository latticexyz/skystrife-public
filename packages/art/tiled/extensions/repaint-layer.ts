/// <reference types="@mapeditor/tiled-api" />

/*
 * repaint-layer.js
 *
 * This extension adds a 'Repaint Layer' (Ctrl+Alt+P) action to the
 * Layer menu, repaints all of the existing tiles with the current selected tile
 */

/* global tiled */

const repaintLayer = tiled.registerAction("RepaintLayer", function (/* action */) {
  const map = tiled.activeAsset as TileMap;
  if (!map.isTileMap) {
    tiled.alert("Not a tile map!");
    return;
  }

  if (!map.currentLayer.isTileLayer) {
    tiled.alert("Not selecting a Tile Layer");
    return;
  }

  const layer = map.currentLayer as TileLayer;
  const layerEditor = layer.edit();
  const selectedTiles = tiled.mapEditor.tilesetsView.selectedTiles;

  if (selectedTiles.length == 0) {
    tiled.alert("Not selecting a Tile in Tilesets window");
    return;
  }

  const selectedTile = selectedTiles[0];

  for (let y = 0; y < map.height; ++y) {
    for (let x = 0; x < map.width; ++x) {
      const tile = layer.tileAt(x, y);
      if (tile) {
        layerEditor.setTile(x, y, selectedTile);
      }
    }
  }
  layerEditor.apply();
});
repaintLayer.text = "Repaint Layer";
repaintLayer.shortcut = "Ctrl+Alt+P";

tiled.extendMenu("Layer", [{ action: "RepaintLayer" }]);
