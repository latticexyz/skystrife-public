import { GameScene } from "phaserx/src/types";

export function definePhaserConfig(options: {
  scenes: GameScene[];
  scale: Phaser.Types.Core.GameConfig["scale"];
}): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.HEADLESS,
    scale: options.scale,
    pixelArt: true,
    autoFocus: true,
    render: {
      antialiasGL: false,
      pixelArt: true,
    },
    scene: options.scenes,
  };
}
