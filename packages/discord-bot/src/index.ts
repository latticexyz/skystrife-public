import "dotenv/config";
import { Client, Events, GatewayIntentBits, TextChannel } from "discord.js";
import { createSkyStrife } from "headless-client/src/createSkyStrife";
import { createMatchUpdater } from "./createMatchUpdater";
import { createSeasonPassNotifier } from "./createSeasonPassNotifier";

const skyStrife = await createSkyStrife();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

export const MATCHMAKING_ROLE = "Sky Strife Matchmaking";

// add to server link
// https://discord.com/api/oauth2/authorize?client_id=1207194263860023376&permissions=17601044491328&scope=bot%20applications.commands

client.login(process.env.DISCORD_BOT_SECRET);

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);

  const notifChannel = readyClient.channels.cache.get(process.env.CHANNEL_ID ?? "0") as TextChannel | undefined;
  if (!notifChannel) throw new Error("Channel not found");

  console.log(`Server Name: ${notifChannel.guild.name}`);
  console.log(`Linked to channel: ${notifChannel.name} (${notifChannel.id})`);

  createMatchUpdater(skyStrife, notifChannel);
  createSeasonPassNotifier(skyStrife, notifChannel);

  readyClient.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.member) return;

    if (message.content.includes("!join")) {
      try {
        const role = message.guild.roles.cache.find((role) => role.name === MATCHMAKING_ROLE);
        if (!role) return;

        await message.member.roles.add(role);
        message.reply("You have been added to matchmaking!");
      } catch (error) {
        console.error(error);
        message.reply("There was an error removing the role.");
      }
    }

    if (message.content.includes("!leave")) {
      try {
        const role = message.guild.roles.cache.find((role) => role.name === MATCHMAKING_ROLE);
        if (!role) return;

        await message.member.roles.remove(role);
        message.reply("You have been removed from matchmaking.");
      } catch (error) {
        console.error(error);
        message.reply("There was an error removing the role.");
      }
    }
  });
});
