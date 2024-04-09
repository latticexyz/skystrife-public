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
      components: { LocalGold },
      api: { getCurrentGold, getCurrentRegen },
    },
  } = useMUD();

  const [gold, setGold] = useState(0);
  const [regen, setRegen] = useState(0);

  const gold$ = useMemo(
    () => LocalGold.update$.pipe(filter((update) => update.entity === playerData?.player)),
    [LocalGold.update$, playerData?.player],
  );

  const regenRate$ = useMemo(
    () =>
      Chargee.update$.pipe(
        filter((update) => {
          return update.value[0]?.value === playerData?.player;
        }),
      ),
    [Chargee.update$, playerData?.player],
  );

  useEffect(() => {
    if (!playerData?.player) return;

    const { player } = playerData;

    setGold(getCurrentGold(player));
    setRegen(getCurrentRegen(player));

    const sub = merge(gold$, regenRate$).subscribe(() => {
      if (!player) return;

      setGold(getCurrentGold(player));
      setRegen(getCurrentRegen(player));
    });
    return () => sub.unsubscribe();
  }, [gold$, getCurrentGold, playerData?.player, regenRate$, getCurrentRegen, playerData]);

  return {
    amount: gold,
    regen,
  };
};
