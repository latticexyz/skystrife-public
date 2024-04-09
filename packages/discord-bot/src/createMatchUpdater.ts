import "dotenv/config";
import { TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js";
import { Has, getComponentValue, Entity, defineQuery } from "@latticexyz/recs";
import { encodeMatchEntity } from "client/src/encodeMatchEntity";
import { Hex, formatEther, hexToString } from "viem";
import { defineRxSystem } from "@latticexyz/recs";
import { merge, debounceTime } from "rxjs";
import lodash from "lodash";
import { formatAddress } from "client/src/layers/Headless/utils";
import { toEthAddress } from "@latticexyz/utils";
import { createSkyStrife } from "headless-client/src/createSkyStrife";
import { MATCHMAKING_ROLE } from ".";
import { DateTime } from "luxon";

const url = process.env.CHAIN_ID === "17001" ? "https://playtest.skystrife.xyz" : "http://localhost:1337";

/**
 * Update match notification messages in the notification channel
 * when matches are created and people join them.
 */
export const createMatchUpdater = async (
  skyStrife: Awaited<ReturnType<typeof createSkyStrife>>,
  notifChannel: TextChannel,
) => {
  const {
    networkLayer: {
      world,
      components: { MatchConfig, MatchName, MatchPlayers, Name, MatchFinished },
      utils: { getMaxPlayers, getMatchRewards, getMatchAccessDetails },
    },
    headlessLayer: {
      api: { getPlayerInfo },
    },
  } = skyStrife;

  const msgCache = new Map<Entity, Message<true>>();

  const newMatch = defineQuery([Has(MatchConfig), Has(MatchName)]);
  const updateMessage$ = merge(MatchFinished.update$, MatchPlayers.update$, newMatch.update$).pipe(debounceTime(1000));

  defineRxSystem(world, updateMessage$, (data) => {
    const { entity } = data as { entity: Entity };
    const matchPlayers = (getComponentValue(MatchPlayers, entity)?.value ?? []) as Entity[];

    const matchName = getComponentValue(MatchName, entity)?.value;
    const currentPlayers = matchPlayers.length;
    const maxPlayers = getMaxPlayers(entity);

    const matchFinished = getComponentValue(MatchFinished, entity)?.value;
    if (matchFinished && msgCache.has(entity)) {
      const msg = msgCache.get(entity);
      if (!msg) return;

      console.log(`Match ${matchName} has finished, deleting message...`);

      msg.delete();
      msgCache.delete(entity);
      return;
    }

    console.log(`Match ${matchName} has ${currentPlayers} players out of ${getMaxPlayers(entity)}`);

    setTimeout(async () => {
      if (!notifChannel) return;

      const matchConfig = getComponentValue(MatchConfig, entity);
      if (!matchConfig) return;

      const matchRegistrationTime = matchConfig.registrationTime;
      if (DateTime.now().toSeconds() < matchRegistrationTime) return;

      const { hasAllowList, isSeasonPassOnly } = getMatchAccessDetails(entity);
      // never notify discord about private matches
      if (hasAllowList) return;

      const role = notifChannel.guild.roles.cache.find((r) => r.name === MATCHMAKING_ROLE);
      const roleMention = role ? `${role.toString()}\n` : "";

      const createdBy = matchConfig.createdBy as Entity;
      const creatorName = getComponentValue(Name, createdBy)?.value ?? formatAddress(toEthAddress(createdBy) as Hex);
      const matchAccessMessage = isSeasonPassOnly ? "🎫 Season Pass Only Match" : "🌏 Public Match";

      const gameIsStarting = currentPlayers === maxPlayers;
      const statusEmoji = gameIsStarting ? "🟢" : "🟡";
      const levelName = `🗾 ${hexToString(matchConfig.levelId as Hex, { size: 32 })}`;

      const matchRewards = getMatchRewards(entity);
      const entranceFee = matchRewards.entranceFee;
      const totalReward = matchRewards.totalRewards.reduce((acc, reward) => acc + reward.value, 0n);
      const entranceFeeMsg = `${entranceFee ? `🔮 ${formatEther(entranceFee)}` : "No"} entrance fee`;
      const rewardMsg = `🔮 ${formatEther(totalReward)} total reward`;
      const rewardsByRank = matchRewards.totalRewards.map((reward, i) => {
        return `- Rank ${i + 1}: 🔮 ${formatEther(reward.value)}`;
      });

      const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel(currentPlayers === maxPlayers ? "Spectate Match" : "Join Match")
          .setStyle(ButtonStyle.Link)
          .setURL(`${url}/match?match=${entity}`),
      );

      const msgContent = `${roleMention}${statusEmoji} Match **${matchName}** is ${
        currentPlayers === maxPlayers ? "live!" : "waiting for players..."
      }
👑 Created by: **${creatorName}**
${matchAccessMessage}
${levelName}
${rewardMsg} / ${entranceFeeMsg}
${rewardsByRank.join("\n")}
🗣 Current Players:
${lodash
  .times(maxPlayers)
  .map((i) => {
    const player = matchPlayers[i];
    if (!player) return `- Player ${i + 1}: Empty`;

    const playerEntity = encodeMatchEntity(entity, player);
    const playerDetails = getPlayerInfo(playerEntity);
    if (!playerDetails) return `- Player ${i + 1}: Empty`;

    const { name } = playerDetails;

    return `- Player ${i + 1}: ${name ? `**${name}**` : "Empty"}`;
  })
  .join("\n")}`;

      if (msgCache.has(entity)) {
        const msg = msgCache.get(entity);
        if (!msg) return;

        msg.edit({
          content: msgContent,
          components: [buttonRow],
        });
      } else {
        const msg = await notifChannel.send({
          content: msgContent,
          components: [buttonRow],
        });

        msgCache.set(entity, msg);
      }
    }, 2_000);
  });
};
