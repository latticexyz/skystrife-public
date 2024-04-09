import { Browser } from "ecs-browser";
import { useAmalgema } from "../../../useAmalgema";
import { Type, defineComponent } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { Hex } from "viem";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { encodeValueArgs } from "@latticexyz/protocol-parser/internal";

export const ComponentBrowser = () => {
  const amalgemaLayer = useAmalgema();
  const {
    network: { world, worldContract },
    components,
  } = amalgemaLayer;

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "|") {
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, []);

  return (
    <>
      {visible && (
        <div className="h-screen w-screen absolute top-0 left-0 z-50">
          <Browser
            world={world}
            layers={{
              network: amalgemaLayer,
            }}
            devHighlightComponent={defineComponent(world, { value: Type.OptionalNumber }, {})}
            setContractComponentValue={(entity, recsComponent, value) => {
              const component = Object.values(components).find((component) => component.id === recsComponent.id);

              if (component && component.metadata) {
                const keyArray: Hex[] = [];
                const keyTuple = decodeEntity(component.metadata.keySchema, entity);
                Object.values(keyTuple).forEach((key) => keyArray.push(key));

                const { staticData, encodedLengths, dynamicData } = encodeValueArgs(
                  component.metadata.valueSchema,
                  value
                );

                worldContract.write.setRecord([component.id as Hex, keyArray, staticData, encodedLengths, dynamicData]);
              }
            }}
          />
        </div>
      )}
    </>
  );
};
