import { Routes, REST, Client, GatewayIntentBits, Partials } from "discord.js";
import getConfig from "next/config";
import { prisma } from "@/prisma/utils";

const { serverRuntimeConfig } = getConfig();
const client = serverRuntimeConfig.discordClient;
const channel = client.channels.cache.get(process.env.CHANNEL_ID);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "getreservation") {
    const userid = interaction.options.get("clientid")?.value;
    let all;
    if (userid) {
      all = await prisma.reservation.findMany({
        where: {
          userId: userid,
        },
      });
    } else {
      all = await prisma.reservation.findMany({});
    }
    if (all.length === 0) {
      interaction.reply(
        "There are no reservation for this specific userId, or all user doesn't have any reservation"
      );
    } else {
      interaction.reply(JSON.stringify(all));
    }

    console.log(all);
  }
});

client.on("messageCreate", (message) => {
  if (message.author.username !== "hahahoho") {
    if (!channel) {
      console.error(`Unknown channel ID: ${process.env.CHANNEL_ID}`);
      return;
    }
    channel.send(message.content);
  }
  if (message.author.username === "down") {
    if (!channel) {
      console.error(`Unknown channel ID: ${process.env.CHANNEL_ID}`);
      return;
    }
    channel.send("จุ้จุ้จุ้");
  }
  if (message.author.username === "Theresa Rossweisse") {
    if (!channel) {
      console.error(`Unknown channel ID: ${process.env.CHANNEL_ID}`);
      return;
    }
    channel.send("Master! You da best!");
  }
});

async function sendDiscordMessage(message: string) {
  client.channels.cache.get(process.env.CHANNEL_ID).send(message);
}

export { sendDiscordMessage };
