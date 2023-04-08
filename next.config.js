// next.config.js

const {
  Client,
  GatewayIntentBits,
  Partials,
  Routes,
  REST,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const command1 = [
  {
    name: "hey",
    description: "Kyou wa have a nice day",
  },
  {
    name: "getreservation",
    description: "get all yuor reservation",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("registering slash command");

    await rest.put(
      Routes.applicationGuildCommands(
        "1093471394899165184",
        "1062733368975966298"
      ),
      { body: command1 }
    );
    console.log("slash command mounted!");
  } catch (e) {
    console.log("error: ", e);
  }
})();

client.login(process.env.DISCORD_BOT_TOKEN);

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "hey") {
    interaction.reply("hey!");
  }
});

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
