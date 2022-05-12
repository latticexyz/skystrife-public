import { getComponentValue, Has, hasComponent, HasValue, runQuery } from "@latticexyz/recs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { filter, merge } from "rxjs";
import { useMUD } from "../../../useMUD";
import { useCurrentPlayer } from "./useCurrentPlayer";
import { decodeMatchEntity } from "../../../decodeMatchEntity";

export const usePlayerGold = (playerData: ReturnType<typeof useCurrentPlayer>) => {
  const {
    networkLayer: {
      components: { Chargee, Charger },
    },
    headlessLayer: {
      components: { LocalStamina, Depleted, InCurrentMatch },
      api: { getCurrentStamina },
    },
  } = useMUD();

  const [stamina, setStamina] = useState(0);
  const [regen, setRegen] = useState(0);

  const stamina$ = useMemo(
    () => LocalStamina.update$.pipe(filter((update) => update.entity === playerData?.player)),
    [LocalStamina.update$, playerData?.player]
  );

  const regenRate$ = useMemo(
    () =>
      Chargee.update$.pipe(
        filter((update) => {
          return update.value[0]?.value === playerData?.player;
        })
      ),
    [Chargee.update$, playerData?.player]
  );

  const getCurrentRegen = useCallback(() => {
    if (!playerData?.player) return 0;

    const chargers = runQuery([
      Has(InCurrentMatch),
      HasValue(Chargee, { value: decodeMatchEntity(playerData.player).entity }),
    ]);
    const regen = [...chargers].reduce((acc, charger) => {
      if (hasComponent(Depleted, charger)) return acc;

      const chargeValue = getComponentValue(Charger, charger)?.value;
      if (!chargeValue) return acc;
      return acc + chargeValue;
    }, 0);

    return regen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerData?.player]);

  useEffect(() => {
    if (!playerData?.player) return;

    setStamina(getCurrentStamina(playerData?.player));
    setRegen(getCurrentRegen());

    const sub = merge(stamina$, regenRate$).subscribe(() => {
      if (!playerData?.player) return;

      setStamina(getCurrentStamina(playerData.player));
      setRegen(getCurrentRegen());
    });
    return () => sub.unsubscribe();
  }, [stamina$, getCurrentStamina, playerData?.player, regenRate$, getCurrentRegen]);

  return {
    amount: stamina,
    regen,
  };
};
