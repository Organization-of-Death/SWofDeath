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
    const { id } = req.body;

    const allre = await prisma.reservation.findFirst({
      where: {
        id: id,
      },
    });
    if (!allre) {
      return res
        .status(200)
        .json({ message: "There is no reservation with such as id" });
    }
    res.status(200).json(allre);
  } else if (req.method === "DELETE") {
    const { id } = req.body;
    try {
      const allre = await prisma.reservation.delete({
        where: {
          id: id,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          res
            .status(400)
            .json({ message: "There is no reservation to delete" });
        }
      }
    }
    res.status(200).json({ message: "Succesfully deleted" }); //return number of record deleted
  } else {
    const { id, userId, date, musicURL } = req.body; //id = which reservation id to update
    let newup;
    try {
      newup = await prisma.reservation.update({
        where: {
          id,
        },
        data: {
          userId,
          date,
          musicURL: musicURL ? musicURL : "",
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          res
            .status(400)
            .json({ message: "There is no reservation to update" });
        }
      }
    }
    return res.status(200).json(newup);
  }
}
