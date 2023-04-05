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
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email, password } = req.body as SignInInput;

  try {
    //try check input
    signInSchema.parse({ email, password });

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (user) {
      bcrypt.compare(password, user.password, function (err, result) {
        if (!result) {
          return res
            .status(400)
            .json({ message: "รหัสผิดนะจร้าาาาาาาาาาาาาาาาาาา :(" });
        } else {
          //gen Token
          const token = jwt.sign(
            { email: user.email, id: user.id, role: user.role },
            process.env.SECRET_KEY,
            {
              expiresIn: "30d",
            }
          );

          //signed up
          const message = `Hello, ${email} Succesfully logged in! :)`;
          return res.status(200).json({ message, token });
        }
      });
    } else {
      //User do not exist
      return res.status(400).json({ message: "หิวข้าว :{" });
    }
    //Don't put any function or return under this line
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
      res.status(500).json({ message: "Internal Server Error", error });
    }
  }
}
