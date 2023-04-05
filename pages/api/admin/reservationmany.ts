import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";
import { signInSchema } from "@/pages/types/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Infer the type of the input object from the schema
type SignInInput = z.infer<typeof signInSchema>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const allre = await prisma.reservation.findMany({});
    res.status(200).json(allre);
  } else if (req.method === "DELETE") {
    const allre = await prisma.reservation.deleteMany({});
    res.status(200).json(allre); //return number of record deleted
  }
}
