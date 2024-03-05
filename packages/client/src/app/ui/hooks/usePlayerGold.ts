import { useEffect, useMemo, useState } from "react";
import { filter, merge } from "rxjs";
import { useMUD } from "../../../useMUD";
import { useCurrentPlayer } from "./useCurrentPlayer";

export const usePlayerGold = (playerData: ReturnType<typeof useCurrentPlayer>) => {
  const {
    networkLayer: {
      components: { Chargee },
    },
    headlessLayer: {
      components: { LocalStamina },
      api: { getCurrentStamina, getCurrentRegen },
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

  useEffect(() => {
    if (!playerData?.player) return;

    const { player } = playerData;

    setStamina(getCurrentStamina(player));
    setRegen(getCurrentRegen(player));

    const sub = merge(stamina$, regenRate$).subscribe(() => {
      if (!player) return;

      setStamina(getCurrentStamina(player));
      setRegen(getCurrentRegen(player));
    });
    return () => sub.unsubscribe();
  }, [stamina$, getCurrentStamina, playerData?.player, regenRate$, getCurrentRegen, playerData]);

  return {
    amount: stamina,
    regen,
  };
};
