/// <reference types="@mapeditor/tiled-api" />

/*
 * create-component-layer.js
 *
 * This extension adds a 'Create Component Layer' (Command+Shift+L) action to the
 * Layer menu, which can be used to quickly create a properly structure component layer
 */

/* global tiled */

const createComponentLayer = tiled.registerAction("CreateComponentLayer", function (/* action */) {
  const map = tiled.activeAsset as TileMap;
  if (!map.isTileMap) {
    tiled.alert("Not a tile map!");
    return;
  }

  let entityLayer;

  if (map.currentLayer.isGroupLayer && map.currentLayer.property("entityLayer")) {
    entityLayer = map.currentLayer;
  } else {
    const entityLayerName = tiled.prompt("Please enter the name of the Entity Layer (ex: Terrain):");
    if (entityLayerName == "") {
      return;
    }

    const groupLayer = new GroupLayer(entityLayerName);
    groupLayer.setProperty("entityLayer", true);

    map.addLayer(groupLayer);
    entityLayer = groupLayer;
  }

  const componentLayerName = tiled.prompt("Please enter the name of the Component (ex: terrainType):");
  if (componentLayerName == "") {
    return;
  }

  let componentLayerEncoding = tiled.prompt("Please enter the encoding of the Component value (ex: bool, uint32):");
  if (componentLayerEncoding == "") {
    componentLayerEncoding = "bool";
  }

  const componentLayer = new GroupLayer(componentLayerName);
  componentLayer.setProperty("encoding", componentLayerEncoding);

  entityLayer.addLayer(componentLayer);
});
createComponentLayer.text = "Create Component Layer";
createComponentLayer.shortcut = "Ctrl+Alt+L";

tiled.extendMenu("Layer", [{ action: "CreateComponentLayer" }]);
