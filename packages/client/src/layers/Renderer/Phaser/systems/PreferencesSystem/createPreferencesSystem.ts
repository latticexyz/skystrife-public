import { defineSystem, Has } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createPreferencesSystem(layer: PhaserLayer) {
  const {
    parentLayers: {
      local: {
        world,
        components: { Preferences },
        api: { getPreferences },
      },
    },
    game,
  } = layer;

  defineSystem(world, [Has(Preferences)], () => {
    const preferences = getPreferences();
    const { musicVolume, muteMusic } = preferences;

    game.sound.mute = muteMusic;
    if (game.sound.volume !== musicVolume) game.sound.volume = musicVolume / 100;
  });
}
