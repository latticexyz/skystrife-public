export function defineScene(options: {
  key: string;
  preload?: (scene: Phaser.Scene) => void;
  create?: (scene: Phaser.Scene) => void;
  update?: (scene: Phaser.Scene) => void;
}) {
  const { preload, create, update, key } = options;
  return class GameScene extends Phaser.Scene {
    constructor() {
      super({ key });
    }

    preload() {
      preload && preload(this);
    }

    create() {
      create && create(this);
    }

    update() {
      update && update(this);
    }
  };
}
