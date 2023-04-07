import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";
import { SignUpInput, signUpSchema } from "@/pages/types/schema";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { prisma } from "@/prisma/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "only POST is supported" });
    return;
  }

  const { email, password, name, phoneNumber, role } = req.body as SignUpInput;

  try {
    //try check input
    signUpSchema.parse({ email, password, name, phoneNumber, role });

    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Use salt to hash password
    const hashedPassword = await bcrypt.hash(password, salt);

    // create a user in the database ไม่เก่งแล้ว
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phoneNumber,
        role,
      },
    });

    //gen Token
    const token = jwt.sign(
      { email: email, password: hashedPassword },
      process.env.SECRET_KEY as Secret,
      {
        expiresIn: "30d",
      }
    );

    //signed up
    const message = `Hello, ${email} U become our family now!`;
    res.status(200).json({ message, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const code = error.errors[0].code;
      if (code === "invalid_enum_value") {
        res.status(400).json({ message: "Choose wisely, admin or user???" });
      } else if (code === "invalid_type") {
        res
          .status(400)
          .json({ message: "We use TypeScript bro, check type :)" });
      } else {
        res.status(400).json({
          message: "Check your input carefully, especially TYPE",
          error_code: error.errors[0].message,
        });
      }
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.status(400).json({ message: "Choose your email wisely" });
      }
    } else {
      // If the error is not a Zod validation error, handle it according to your needs
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
async function generateSalt(): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return salt;
}
