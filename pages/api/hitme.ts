import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === 'POST') {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    const message = `Hello, ${name}!`;
    res.status(200).json({ message });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
