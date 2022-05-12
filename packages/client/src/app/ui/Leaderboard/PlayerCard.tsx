import { useEntityQuery } from "@latticexyz/react";
import { useCurrentPlayer } from "../hooks/useCurrentPlayer";
import { usePlayerGold } from "../hooks/usePlayerGold";
import Color from "color";
import { useMUD } from "../../../useMUD";
import { Has, HasValue } from "@latticexyz/recs";
import { decodeMatchEntity } from "../../../decodeMatchEntity";

export function PlayerCard(props: { playerData: NonNullable<ReturnType<typeof useCurrentPlayer>> }) {
  const {
    networkLayer: {
      components: { UnitType, Position, OwnedBy },
    },
    headlessLayer: {
      components: { InCurrentMatch },
    },
  } = useMUD();

  const { playerColor, name } = props.playerData;

  const playerGold = usePlayerGold(props.playerData);
  const allPlayerUnits = useEntityQuery([
    Has(InCurrentMatch),
    Has(UnitType),
    Has(Position),
    HasValue(OwnedBy, { value: decodeMatchEntity(props.playerData.player).entity }),
  ]);

  return (
    <li className="flex w-full flex-row gap-2.5">
      <div className="flex w-[120px] grow-0 flex-row items-center">
        <div
          style={{
            backgroundColor: Color(playerColor.color).toString(),
            width: "16px",
            minWidth: "16px",
            height: "16px",
            borderRadius: "2px",
          }}
        ></div>
        <div className="ml-[8px] overflow-hidden text-ellipsis whitespace-nowrap">{name}</div>
      </div>
      <div
        style={{
          color: "#D4AF37",
        }}
        className="grow basis-1"
      >
        {allPlayerUnits.length}
      </div>
      <div
        style={{
          color: "#D4AF37",
        }}
        className="grow basis-1"
      >
        {playerGold.regen}g
      </div>
    </li>
  );
}
