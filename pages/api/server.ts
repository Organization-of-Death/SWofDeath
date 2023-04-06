import { Client, Intents, Events, GatewayIntentBits } from "discord.js";
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const CHANNEL_ID = "1062733457475772427";
const DISCORD_TOKEN =
  "MTA5MzQ3MTM5NDg5OTE2NTE4NA.GTKPrP.lp2F7ZUZGvHB-JgPfBsKzgtl7uRbfvxYRPyCto";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  const channel = client.channels.cache.get(CHANNEL_ID);
  if (!channel) {
    console.error(`Unknown channel ID: ${CHANNEL_ID}`);
    return;
  }
  channel.send({ content: "Finallly!!!!" });
});

client.login(DISCORD_TOKEN);
