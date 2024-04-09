import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Entity, Has } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { useMUD } from "../../../useMUD";
import { useAllPlayerDetails } from "../hooks/usePlayerDetails";
import { Button } from "../Theme/SkyStrife/Button";
import { Hex, hexToString } from "viem";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { BYTES32_ZERO } from "../../../constants";

export const PrototypeSpawner = () => {
  const {
    networkLayer: {
      components: { Admin, TemplateTables },
      api: {
        dev: { spawnTemplateAt },
      },
      network: { matchEntity },
    },
    phaserLayer: {
      components: { HoverHighlight },
      scenes: {
        Main: { input },
      },
    },
  } = useMUD();

  const [spawning, setSpawning] = useState<Entity | undefined>();
  const [owner, setOwner] = useState<Entity | undefined>();
  const [selectingLocation, setSelectingLocation] = useState(false);

  const hoverPosition = useComponentValue(HoverHighlight, singletonEntity);
  const allPrototypes = useEntityQuery([Has(TemplateTables)]);
  const prototypes = allPrototypes
    .map((id) => {
      const name = hexToString(id as Hex, { size: 32 });
      const toggleSpawning = () => {
        setSpawning(id);
      };
      return { id, name, spawning, toggleSpawning };
    })
    .filter(({ name }) => name);

  const allPlayers = useAllPlayerDetails(matchEntity || undefined);
  const admins = useEntityQuery([Has(Admin)]);

  useEffect(() => {
    if (!selectingLocation) return;

    const sub = input.click$.subscribe(() => {
      if (spawning && hoverPosition && hoverPosition?.x != null && hoverPosition?.y != null) {
        spawnTemplateAt(spawning, { x: hoverPosition.x, y: hoverPosition.y }, { owner });
        setSelectingLocation(false);
      }

      sub.unsubscribe();
    });

    return () => sub.unsubscribe();
  }, [hoverPosition, input.click$, owner, selectingLocation, spawnTemplateAt, spawning]);

  return (
    <div className="flex flex-wrap">
      <div className="flex flex-col">
        <select value={spawning} onChange={(e) => setSpawning(e.target.value as Entity)} className="mb-4">
          <option value={undefined}>Select a prototype</option>
          {prototypes.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        <select value={owner} onChange={(e) => setOwner(e.target.value as Entity)} className="mb-4">
          <option key={BYTES32_ZERO} value={BYTES32_ZERO}>
            No Owner
          </option>
          {admins.map((player) => (
            <option key={player} value={player}>
              Admin
            </option>
          ))}
          {allPlayers.map((player) => {
            const { playerId, name } = player;
            return (
              <option key={playerId} value={playerId}>
                {name}
              </option>
            );
          })}
        </select>

        <Button
          buttonType="primary"
          onClick={() => {
            if (spawning) {
              setSelectingLocation(true);
            }
          }}
        >
          {spawning
            ? selectingLocation
              ? `Spawning at (${hoverPosition?.x}, ${hoverPosition?.y})`
              : `Start Spawning`
            : "Select a Prototype"}
        </Button>
      </div>
    </div>
  );
};
