import { Client, GatewayIntentBits, Partials } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

let savedChannel = null;

async function initDiscord() {
  await client.login(process.env.DISCORD_BOT_TOKEN);

  client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    savedChannel = client.channels.cache.get(process.env.CHANNEL_ID);
    sendDiscordMessage("hi");
  });

  client.on("messageCreate", (message) => {
    if (message.author.username !== "hahahoho") {
      if (!savedChannel) {
        console.error(`Unknown channel ID: ${process.env.CHANNEL_ID}`);
        return;
      }
      savedChannel.send(message.content);
    }
    if (message.author.username === "down") {
      if (!savedChannel) {
        console.error(`Unknown channel ID: ${process.env.CHANNEL_ID}`);
        return;
      }
      savedChannel.send("จุ้จุ้จุ้");
    }
    if (message.author.username === "Theresa Rossweisse") {
      if (!savedChannel) {
        console.error(`Unknown channel ID: ${process.env.CHANNEL_ID}`);
        return;
      }
      savedChannel.send("Master! You da best!");
    }
  });
}

async function sendDiscordMessage(message: string) {
  if (!savedChannel) {
    console.error(`Unknown channel ID: ${process.env.CHANNEL_ID}`);
    return;
  }
  savedChannel.send(message);
}

export { client, initDiscord, sendDiscordMessage };
