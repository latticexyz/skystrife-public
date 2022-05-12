/// <reference types="@mapeditor/tiled-api" />

/*
 * ecs-format.js
 *
 * This extension adds the 'ecs map format' type to the Export As menu,
 * which can be used to generate ecs state events for bulk uploading
 */

/* global tiled, TextFile */

interface Entity {
  templateId: string;
  values: { Position: { x: number, y: number } },
}

tiled.registerMapFormat("MUD Templates", {
  name: "MUD Template Format",
  extension: "json",

  write: (map, fileName) => {
    const data = new Array<Entity>();

    const X_OFFSET = Math.floor(map.width / 2);
    const Y_OFFSET = Math.floor(map.height / 2);

    for (let y = 0; y < map.height; ++y) {
      for (let x = 0; x < map.width; ++x) {
        for (let layerIndex = 0; layerIndex < map.layerCount; ++layerIndex) {
          const layer = map.layerAt(layerIndex);
          if (!layer.isGroupLayer || !layer.property("entityLayer")) continue;
          const entityLayer = layer as GroupLayer;

          for (let subLayerIndex = 0; subLayerIndex < entityLayer.layerCount; ++subLayerIndex) {
            const subLayer = entityLayer.layerAt(subLayerIndex);
            if (subLayer.isTileLayer && subLayer.property("prototypeLayer")) {
              const prototypeLayer = subLayer as TileLayer;
              const tile = prototypeLayer.tileAt(x, y);

              if (tile) {
                const templateId = tile.property("prototype");
                if (templateId! instanceof String) {
                  tiled.alert("TILE: " + x + ", " + y + " IS MISSING ITS PROTOTYPE METADATA");
                  return "error";
                }

                data.push({
                  templateId: templateId as string,
                  values: { Position: { x: x - X_OFFSET, y: y - Y_OFFSET,  } },
                });

              }
            }
          }
        }
      }
    }

    const file = new TextFile(fileName, TextFile.WriteOnly);
    file.write(JSON.stringify(data));
    file.commit();
    return "";
  },
});
