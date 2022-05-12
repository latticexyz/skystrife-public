const asyncFileLoader = (loaderPlugin: Phaser.Loader.LoaderPlugin) => {
  return new Promise<void>((resolve) => {
    loaderPlugin.on("filecomplete", () => resolve()).on("loaderror", () => resolve());
    loaderPlugin.start();
  });
};

export const createSounds = async (scene: Phaser.Scene) => {
  const sounds: Record<string, Phaser.Sound.BaseSound> = {};

  const musicKeys = ["field-battle", "game-over", "intense-battle"];
  for (const musicKey of musicKeys) {
    const loader = scene.load.audio(musicKey, `public/assets/sounds/${musicKey}.m4a`);
    await asyncFileLoader(loader);
    sounds[musicKey] = scene.sound.add(musicKey, { loop: true, volume: 0.12 });
  }

  const soundsKeys = ["ui-1"];
  for (const soundKey of soundsKeys) {
    const loader = scene.load.audio(soundKey, `public/assets/sounds/${soundKey}.wav`);
    await asyncFileLoader(loader);
    sounds[soundKey] = scene.sound.add(soundKey, { volume: 0.5 });
  }

  return sounds;
};
