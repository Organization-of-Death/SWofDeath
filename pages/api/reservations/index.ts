import type { NextApiRequest, NextApiResponse } from "next";
import { Reservation, Role } from "@prisma/client";
import { prisma } from "@/prisma/utils";
import { reservationInput, reservationSchema } from "@/pages/types/schema";
import { sendDiscordMessage } from "@/pages/types/discord";

type ReservationData = {
  message: String;
  total?: number;
  data?: Reservation | Reservation[];
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReservationData>
) {
  // extract the users data from the headers that was modified by the middleware
  const userId = parseInt(req.headers["jesus-id"] as string);
  const userRole = req.headers["jesus-role"] as Role;
  const searchParams: {
    where: {
      userId?: number;
    };
  } = userRole === Role.USER ? { where: { userId: userId } } : { where: {} };

  if (req.method === "GET") {
    // if he's a USER get all of his reservations, otherwise (he's an admin) query all of the reservations
    const reservations = await prisma.reservation.findMany(searchParams);
    sendDiscordMessage(`เอาเยอะนะเราอ่ะ เป็นแค่ ${userRole} เองนิ`);

    return res
      .status(200)
      .json({
        message: "successfully retrieved reservations",
        total: reservations.length,
        data: reservations,
      });
  } else if (req.method === "POST") {
    // if it's USER role, check if there's already 3 reservations or not
    if (userRole === Role.USER) {
      const reservations = await prisma.reservation.findMany({
        where: {
          userId: userId,
        },
      });

      if (reservations.length >= 3) {
        return res.status(405).json({ message: "นวดเยอะไปไม่ดีนะ" });
      }
    }

    // extract the payload data from the request body
    const payload: reservationInput = {
      ...req.body,
      date: new Date(req.body.date),
      userId,
    };
    const { date, massageShopId, musicURL } = payload;

    let reservation: Reservation | null;
    try {
      reservationSchema.parse({ date, massageShopId, userId, musicURL });

      reservation = await prisma.reservation.create({
        data: {
          date: date,
          massageShop: {
            connect: {
              id: massageShopId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
          musicURL: payload.musicURL,
        },
      });
    } catch (error) {
      // if there's no such messageShop
      return res.status(500).json({ message: error as String });
    }

    return res
      .status(200)
      .json({ message: "created reservation successfully", data: reservation });
  } else if (req.method === "DELETE") {
    const reservations = await prisma.reservation.deleteMany(searchParams);

    return res
      .status(200)
      .json({
        message: `succesfully deleted ${reservations.count} reservations`,
      });
  } else {
    return res
      .status(405)
      .json({ message: "only GET,POST,DELETE are supported", data: undefined });
  }
}

export default handler;
