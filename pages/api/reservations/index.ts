import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === 'GET') {
  
  // if he's a USER get all of his reservations
  

  // else get all reservations


  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

// ว้าย ๆ คิดว่าจะมีโค้ดเยอะกว่านี้หละสิ :)