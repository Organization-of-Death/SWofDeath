import type { NextApiRequest, NextApiResponse } from 'next';
import z from 'zod';
import { signInSchema } from '@/pages/types/schema';

// Infer the type of the input object from the schema
type SignInInput = z.infer<typeof signInSchema>;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { email, password } = req.body as SignInInput;

  try {
   //try check input
    signInSchema.parse({ email, password });


    const message = `Hello, ${email}!`;
    res.status(200).json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Check your input carefully, especially TYPE' });
      } else {
        // If the error is not a Zod validation error, handle it according to your needs
        res.status(500).json({ message: 'Internal Server Error' });
      }
  }
}