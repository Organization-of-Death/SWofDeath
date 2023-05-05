import type { NextApiRequest, NextApiResponse } from "next";
import { Reservation, Role, User } from "@prisma/client";
import { prisma } from "@/prisma/utils";
import { reservationInput, reservationSchema } from "@/pages/types/schema";
import { sendDiscordMessage } from "@/pages/types/discord";

type UserSummary = {
  id: number;
  name: string | null;
};

type FriendshipData = {
  message: String;
  total?: number;
  data?: UserSummary[];
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FriendshipData>
) {
  // extract the users data from the headers that was modified by the middleware
  const userId = parseInt(req.headers["jesus-id"] as string);
  const userRole = req.headers["jesus-role"] as Role;

  if (req.method === "GET") {
    const { id } = req.query;
    const queryId = parseInt(typeof id === "string" ? id : "-1")
    const myFriends = await getAllMyFriends(userId);

    // return all of the users' friends if the queryId slug is equal to the logged in userId or the user is an admin
    if (queryId === userId || userRole === Role.ADMIN) {
      return res
        .status(200)
        .json({ message: `successfully found friends of user ${userId}`, total: myFriends.length, data: myFriends });

    }

    // else return all of the users' mutual friends with the queryUserId
    else {
      const yourFriends = await getAllMyFriends(queryId);
      const ourFriendsId = myFriends.filter((r) => yourFriends
        .map((r) => r.id)
        .includes(r.id))
        .map((r) => r.id);

      const ourFriends = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
        },
        where: {
          id: {
            in: ourFriendsId,
          }
        }
      });

      return res
        .status(200)
        .json({ message: `successfully found mutual friends of user ${userId} and ${queryId}`, total: ourFriends.length, data: ourFriends });
    }
  } else {
    return res
      .status(405)
      .json({ message: "only GET supported", data: undefined });
  }
}

export default handler;


const getAllMyFriends = async (userId: number): Promise<UserSummary[]> => {
  const requestSent = await prisma.friendRequest.findMany({
    select: {
      toUserId: true
    },
    where: {
      fromUserId: userId,
    },
  });

  const requestReceived = await prisma.friendRequest.findMany({
    select: {
      fromUserId: true
    },
    where: {
      toUserId: userId,
    },
  });

  // friends are those who whose id appeared in both
  const friendIds = requestSent.filter((r) => requestReceived
    .map((r) => r.fromUserId)
    .includes(r.toUserId))
    .map((r) => r.toUserId);

  const friends = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      id: {
        in: friendIds,
      }
    }
  });

  return friends;
}