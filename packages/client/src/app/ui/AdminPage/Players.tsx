import { useAmalgema } from "../../../useAmalgema";
import { Entity, Has } from "@latticexyz/recs";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { toEthAddress } from "@latticexyz/utils";
import { useSeasonPass } from "../../amalgema-ui/hooks/useSeasonPass";
import { Hex, formatEther } from "viem";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { uniq } from "lodash";
import { SeasonPassIcon } from "../../amalgema-ui/SeasonPassIcon";

function Player({ entity, index, matchesJoined }: { entity: Entity; index: number; matchesJoined: number }) {
  const {
    components: { Name, Orb_Balances },
  } = useAmalgema();

  const name = useComponentValue(Name, entity);
  const hasSeasonPass = useSeasonPass(toEthAddress(entity) as Hex);
  const orbBalance = useComponentValue(Orb_Balances, entity);

  return (
    <tr key={entity} className="border-4">
      <td>{index + 1}</td>
      <td>{toEthAddress(entity)}</td>
      <td>
        {name ? name.value : null} {hasSeasonPass ? <SeasonPassIcon /> : ""}
      </td>
      <td>
        <div>
          {formatEther(orbBalance ? orbBalance.value : 0n)}🔮
          <br />
          {matchesJoined} matches joined
        </div>
      </td>
    </tr>
  );
}

export function Players() {
  const {
    components: { MatchPlayer, Name },
  } = useAmalgema();

  const players = useEntityQuery([Has(MatchPlayer)]);

  const namedWallets = useEntityQuery([Has(Name)]);

  const playerWalletEntities = uniq(
    players.map((key) => addressToEntityID(decodeEntity(MatchPlayer.metadata.keySchema, key).playerAddress))
  );

  // calculate this here because if we do it per player it is a performance issue
  const matchesPerPlayer = players.reduce((acc, key) => {
    const { playerAddress } = decodeEntity(MatchPlayer.metadata.keySchema, key);
    const playerEntity = addressToEntityID(playerAddress);

    return {
      ...acc,
      [playerEntity]: (acc[playerEntity] || 0) + 1,
    };
  }, {} as Record<Entity, number>);

  return (
    <div>
      <div className="flex flex-col">
        <div className="w-full text-3xl text-left p-1">Players</div>
        <div className="w-full text-lg text-left p-1">(that have set a Name)</div>
      </div>
      <table className="w-full text-lg text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xl text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th></th>
            <th>Address</th>
            <th>Name</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          {uniq([...playerWalletEntities, ...namedWallets]).map((entity, i) => (
            <Player key={i} entity={entity} index={i} matchesJoined={matchesPerPlayer[entity]} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
