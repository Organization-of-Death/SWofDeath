// next.config.js

const { Client, GatewayIntentBits, Partials } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.login(process.env.DISCORD_BOT_TOKEN);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  const channel = client.channels.cache.get(process.env.CHANNEL_ID);
  channel.send("hi");
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = {
  ...nextConfig,
  serverRuntimeConfig: {
    // Return an object containing the Discord client
    discordClient: client,
  },
};
