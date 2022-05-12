import { Entity } from "@latticexyz/recs";
import { Assets, Sprites } from "../../layers/Renderer/Phaser/phaserConstants";
import { useMUD } from "../../useMUD";
import { useCurrentPlayer } from "./hooks/useCurrentPlayer";
import { usePlayerGold } from "./hooks/usePlayerGold";
import { SpriteImage } from "./Theme/SpriteImage";

export const GoldAmount = ({ matchEntity }: { matchEntity: Entity }) => {
  const {
    phaserLayer: {
      scenes: {
        Main: {
          config: { assets },
        },
      },
    },
  } = useMUD();

  const currentPlayer = useCurrentPlayer(matchEntity);
  const { amount, regen } = usePlayerGold(currentPlayer);

  return (
    <div className="flex flex-row items-center text-[#CEA82C]">
      <div className="flex flex-row text-3xl w-full items-center">
        <SpriteImage spriteKey={Sprites.Gold} />
        <div className="w-2" />
        <div className="text-ss-text-gold text-2xl">{amount}g</div>
      </div>
      <div className="w-full text-right text-ss-text-light">+{regen}g/turn</div>
    </div>
  );
};
