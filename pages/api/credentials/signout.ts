import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";
import { signInSchema } from "@/pages/types/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { sendDiscordMessage } from "@/pages/types/discord";

// Infer the type of the input object from the schema

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {

    // TODO: invalidate the JWTTOKEN

    return res.status(405).json({ message: "only GET is supported" });
  } else {
    sendDiscordMessage(`รีบไปไหนนนนนนนน กลับมาาาาาา`);
    return res.status(200).json({ message: "Sign out successfully ja!" });
  }
}
