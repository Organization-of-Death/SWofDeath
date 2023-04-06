const { Client, Intents, GatewayIntentBits } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  const channel = client.channels.cache.get(process.env.CHANNEL_ID);
  if (!channel) {
    console.error(`Unknown channel ID: ${process.env.CHANNEL_ID}`);
    return;
  }
  channel.send({ content: "Finallly!!!!" });
});

async function initDiscord() {
  await client.login(process.env.DISCORD_BOT_TOKEN);
}

async function sendDiscordMessage(message: string) {
  const channel = client.channels.cache.get(process.env.CHANNEL_ID);
  if (channel) {
    channel.send({ content: message });
  } else {
    console.error(`Unknown channel ID: ${process.env.CHANNEL_ID}`);
  }
}

export { client, initDiscord, sendDiscordMessage };
