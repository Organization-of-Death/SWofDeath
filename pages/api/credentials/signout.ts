import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";
import { signInSchema } from "@/pages/types/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Infer the type of the input object from the schema

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  } else {
    return res.status(200).json({ message: "Sign out successfully ja!" });
  }
}
