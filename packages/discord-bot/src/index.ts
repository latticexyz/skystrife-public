import "dotenv/config";
import { Client, Events, GatewayIntentBits, TextChannel } from "discord.js";
import { createSkyStrife } from "headless-client/src/createSkyStrife";
import { Has, runQuery, getComponentValue, defineSystem, HasValue, Entity } from "@latticexyz/recs";
import { encodeMatchEntity } from "client/src/encodeMatchEntity";
import { Hex, formatEther, hexToString } from "viem";

const skyStrife = await createSkyStrife();

const {
  networkLayer: {
    world,
    components: { MatchSweepstake, MatchConfig, MatchJoinable, MatchName, MatchPlayers, OwnedBy, Name },
    utils: { getMaxPlayers, matchIsLive },
  },
} = skyStrife;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const url = process.env.CHAIN_ID === "17001" ? "https://playtest.skystrife.xyz" : "http://localhost:1337";

// add to server link
// https://discord.com/api/oauth2/authorize?client_id=1207194263860023376&permissions=17601044491328&scope=bot%20applications.commands

client.login(process.env.DISCORD_BOT_SECRET);

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);

  const notifChannel = readyClient.channels.cache.get(process.env.CHANNEL_ID ?? "0") as TextChannel | undefined;

  defineSystem(
    world,
    [Has(MatchPlayers), HasValue(MatchConfig, { startTime: 0n })],
    ({ entity, value, component }) => {
      if (component.id !== MatchPlayers.id) return;

      console.log("MatchPlayers system", entity);

      const [, previousValue] = value;
      const previousMatchPlayers = (previousValue?.value ?? []) as string[];
      const matchPlayers = getComponentValue(MatchPlayers, entity)?.value;

      if (!matchPlayers) return;
      if (matchPlayers.length === previousMatchPlayers.length) return;

      const matchName = getComponentValue(MatchName, entity)?.value;
      const currentPlayers = matchPlayers.length;
      const maxPlayers = getMaxPlayers(entity);

      console.log(`Match ${matchName} has ${currentPlayers} players out of ${getMaxPlayers(entity)}`);

      const newPlayer = matchPlayers.find((player) => !previousMatchPlayers.includes(player));
      if (!newPlayer) return;

      console.log(`New player joined: ${newPlayer}`);

      setTimeout(() => {
        const playerEntity = encodeMatchEntity(entity, newPlayer);
        const owner = getComponentValue(OwnedBy, playerEntity)?.value;
        const matchConfig = getComponentValue(MatchConfig, entity);

        if (!matchConfig) return;
        if (!owner) return;

        const playerName = getComponentValue(Name, owner as Entity)?.value;
        if (!playerName) return;

        console.log(`**${playerName}** joined match **${matchName}**!`);
        if (!notifChannel) return;

        const gameIsStarting = currentPlayers === maxPlayers;
        const statusEmoji = gameIsStarting ? "🟢" : "🟡";
        const levelName = `🗾 ${hexToString(matchConfig.levelId as Hex, { size: 32 })}`;

        const entranceFee = getComponentValue(MatchSweepstake, entity)?.entranceFee;
        const entranceFeeMsg = `🔮 ${entranceFee ? formatEther(entranceFee) : "No"} entrance fee`;

        notifChannel.send(
          `${statusEmoji} **${playerName}** joined [${matchName}](${url}/match?match=${entity}) (${currentPlayers}/${maxPlayers} players)
${levelName}
${entranceFeeMsg}
========================================`
        );
      }, 1000);
    },
    { runOnInit: false }
  );

  readyClient.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    if (message.content.includes("!ping")) {
      message.reply("Pong!");
    }

    if (message.content.includes("!matches")) {
      const joinableMatches = [...runQuery([Has(MatchJoinable)])].filter((m) => !matchIsLive(m));

      message.reply(`🗡 There ${joinableMatches.length === 1 ? "is" : "are"} currently ${
        joinableMatches.length
      } joinable match${joinableMatches.length > 1 ? "es" : ""}🗡${joinableMatches.map((match) => {
        const matchName = getComponentValue(MatchName, match)?.value;
        if (!matchName) return "";

        const currentPlayers = getComponentValue(MatchPlayers, match)?.value.length ?? 0;
        const maxPlayers = getMaxPlayers(match);

        return `\n- **${matchName}** (${currentPlayers}/${maxPlayers})`;
      })}
`);
    }
  });
});
