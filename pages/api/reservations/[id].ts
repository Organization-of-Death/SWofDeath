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
  });

  // if there's no reservation
  if (reservation === null) {
    return res.status(200).json({ message: "no reservation with such id", data: reservation });
  }

  // doesnt belong to the user nor is an ADMIN
  if (!(reservation?.userId === userId || userRole === "ADMIN")) {
    return res.status(401).json({ message: "access denied" });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ message: "success", data: reservation });


  } else if (req.method === 'PUT') {
    // extract the payload data from the request body
    const payload: Omit<Reservation, "id" | "userId"> = { ...req.body, date: new Date(req.body.date) };
    let updatedReservation: Reservation | null;

    try {
      updatedReservation = await prisma.reservation.update({
        where: {
          id: reservationId
        },
        data: {
          date: payload.date,
          massageShop: {
            connect: {
              id: payload.massageShopId
            }
          },
          user: {
            connect: {
              id: userId,
            }
          },
          musicURL: payload.musicURL,
        }
      });
    } catch (error) {
      // if there's no such messageShop
      return res.status(500).json({ message: error as String });
    }
    return res.status(200).json({ message: "updated success", data: updatedReservation });
  } else if (req.method === "DELETE") {
    try {
      const reservation = await prisma.reservation.delete({
        where: {
          id: reservationId,
        }
      });
      return res.status(200).json({ message: "deleted successfully" });
    } catch (error) {
      // if there's no such messageShop
      return res.status(500).json({ message: error as String });
    }
  }

  else {
    res.status(405).json({ message: 'only GET, PUT, DELETE supported' });
  }
}

// ว้าย ๆ คิดว่าจะมีโค้ดเยอะกว่านี้หละสิ :)