import { prisma } from '@/prisma/utils';
import { Reservation, Role } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

type ReservationData = {
  message: String;
  total?: number;
  data?: Reservation | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ReservationData>) {
  // extract the users data from the headers that was modified by the middleware
  const userId = parseInt(req.headers["jesus-id"] as string);
  const userRole = req.headers["jesus-role"] as Role;
  const reservationId = parseInt(typeof req.query.id === "string" ? req.query.id : "-1");
  const reservation = await prisma.reservation.findUnique({
    where: {
      id: reservationId,
    }
  })

  if (req.method === 'GET') {
    // if role = USER and the reservation belongs to the user OR is an ADMIN, return this reservation info
    if ((userRole === "USER" && reservation?.userId === userId)
      || userRole === "ADMIN") {

      // if there's no reservation
      if (reservation === null) {
        return res.status(200).json({ message: "no reservation with such id", data: reservation });
      }

      return res.status(200).json({ message: "success", data: reservation });
    }

    // else return error
    return res.status(401).json({ message: "access denied" });

  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

// ว้าย ๆ คิดว่าจะมีโค้ดเยอะกว่านี้หละสิ :)