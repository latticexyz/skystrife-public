import { Browser } from "ecs-browser";
import { useMUD } from "../../../useMUD";
import { ClickWrapper } from "../Theme/ClickWrapper";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { Hex } from "viem";
import { encodeValueArgs } from "@latticexyz/protocol-parser/internal";

export const ComponentBrowser = () => {
  const layers = useMUD();

  const {
    networkLayer: {
      network: { world, worldContract },
      components,
    },
    phaserLayer: {
      components: { DevHighlight },
    },
  } = layers;

  return (
    <ClickWrapper>
      <Browser
        world={world}
        layers={{
          phaser: layers.phaserLayer,
          network: layers.networkLayer,
          local: layers.localLayer,
          headless: layers.headlessLayer,
        }}
        devHighlightComponent={DevHighlight}
        setContractComponentValue={(entity, recsComponent, value) => {
          const component = Object.values(components).find((component) => component.id === recsComponent.id);

          if (component && component.metadata) {
            const keyArray: Hex[] = [];
            const keyTuple = decodeEntity(component.metadata.keySchema, entity);
            Object.values(keyTuple).forEach((key) => keyArray.push(key));

            const { staticData, encodedLengths, dynamicData } = encodeValueArgs(component.metadata.valueSchema, value);

            worldContract.write.setRecord([component.id as Hex, keyArray, staticData, encodedLengths, dynamicData]);
          }
        }}
      />
    </ClickWrapper>
  );
};
