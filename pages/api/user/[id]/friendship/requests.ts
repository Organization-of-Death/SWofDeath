import type { NextApiRequest, NextApiResponse } from "next";
import { Reservation, Role, User } from "@prisma/client";
import { prisma } from "@/prisma/utils";
import { reservationInput, reservationSchema } from "@/pages/types/schema";
import { sendDiscordMessage } from "@/pages/types/discord";

type FriendRequestsSummary = {
    "outgoing": number[], "incoming": number[]
};
type FriendshipData = {
    message: String;
    total?: { "outgoing": number, "incoming": number };
    data?: FriendRequestsSummary;
};

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FriendshipData>
) {
    // extract the users data from the headers that was modified by the middleware
    const userId = parseInt(req.headers["jesus-id"] as string);
    const userRole = req.headers["jesus-role"] as Role;

    if (req.method === "GET") {
        sendDiscordMessage(`เอาเยอะนะเราอ่ะ เป็นแค่ ${userRole} เองนิ`);

        const { id } = req.query;
        const queryId = parseInt(typeof id === "string" ? id : "-1")
        const myFriendsRequest = await getAllMyFriendRequests(userId);

        // return all of the users' friends if the queryId slug is equal to the logged in userId or the user is an admin
        if (queryId === userId || userRole === Role.ADMIN) {
            return res
                .status(200)
                .json({
                    message: `successfully found friend requests of user ${userId}`, total: {
                        "outgoing": myFriendsRequest.outgoing.length, "incoming": myFriendsRequest.incoming.length
                    }, data: myFriendsRequest
                });

        }

        // else access denied
        return res
            .status(401)
            .json({ message: `unauthorized`});

    } else {
        return res
            .status(405)
            .json({ message: "only GET supported", data: undefined });
    }
}

export default handler;


const getAllMyFriendRequests = async (userId: number): Promise<FriendRequestsSummary> => {
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

    // the friendRequests that are PENDING are those that do not intersect
    const requestSentArray = requestSent.map((r) => r.toUserId);
    const requestReceivedArray = requestReceived.map((r) => r.fromUserId);

    const pendingOutgoing = requestSent.filter((r) => !requestReceivedArray.includes(r.toUserId)).map((r) => r.toUserId);
    const pendingIncoming = requestReceived.filter((r) => !requestSentArray.includes(r.fromUserId)).map((r) => r.fromUserId);

    return { "outgoing": pendingOutgoing, "incoming": pendingIncoming };
}