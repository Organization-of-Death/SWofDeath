import type { NextApiRequest, NextApiResponse } from 'next';
import z from 'zod';
import { signInSchema } from '@/pages/types/schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const secretKey = 'dsdsfnwiicdsca'
// Infer the type of the input object from the schema
type SignInInput = z.infer<typeof signInSchema>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { email, password } = req.body as SignInInput;

  try {
    //try check input
    signInSchema.parse({ email, password });

    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Use salt to hash password
    const hashedPassword = await bcrypt.hash(password, salt);

    //This is how u compare input password with hashedpassword
    bcrypt.compare("22", hashedPassword, function (err, result) {
      console.log(result)
    });

    //gen Token
    const token = jwt.sign({ email: email, password: hashedPassword }, secretKey, {
      expiresIn: '30d'
    });

    // create a user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        salt: salt,
      }
    });

    const message = `Hello, ${email}!`;
    res.status(200).json({ message, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Check your input carefully, especially TYPE' });
    } else {
      // If the error is not a Zod validation error, handle it according to your needs
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }


}
async function generateSalt(): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return salt;
}
