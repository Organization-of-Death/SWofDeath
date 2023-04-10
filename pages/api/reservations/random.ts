import type { NextApiRequest, NextApiResponse } from "next";
import { Reservation, Role } from "@prisma/client";
import { prisma } from "@/prisma/utils";
import { reservationInput, reservationSchema } from "@/pages/types/schema";
import { sendDiscordMessage } from "@/pages/types/discord";
import randomstring from "randomstring";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const randomString = randomstring.generate({
      length: 13,
      charset: "alphanumeric",
    });

    // Return the URL to the randomly generated YouTube video
    res.status(200).json(`https://www.youtube.com/watch?v=${randomString}`);
  }
}

export default handler;
