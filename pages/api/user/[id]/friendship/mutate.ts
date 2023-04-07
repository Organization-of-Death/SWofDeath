/*
    flow of the friendship status mutation:

    - getFriendshipState between userId (me) & queryId (them)
        query the database for outgoing & incoming

    - determine if actionIsAllowed

    - mutateFriendship based on the action:
        switch (action)
            CASE ADD: 
                - add an outgoing to the friendRequest  
                - change friendship state based on the current state
            case REMOVE: 
                - remove both outgoing & incoming from the friendRequest
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { Role } from "@prisma/client";
import { prisma } from "@/prisma/utils";
import { sendDiscordMessage } from "@/pages/types/discord";
import { friendshipMutationAction, friendshipMutationActionT, friendshipMutationInput, friendshipMutationSchema } from "@/pages/types/schema";

enum FriendshipStatus {
    NEUTRAL = "NEUTRAL",
    OUTGOING = "OUTGOING",
    INCOMING = "INCOMING",
    FRIENDLY = "FRIENDLY"
}

type FriendshipStatusData = {
    message: String;
    previous_friendship_status?: FriendshipStatus;
    current_friendship_status?: FriendshipStatus;
};

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FriendshipStatusData>
) {
    // extract the users data from the headers that was modified by the middleware
    const userId = parseInt(req.headers["jesus-id"] as string);
    const userRole = req.headers["jesus-role"] as Role;

    if (req.method === "POST") {
        sendDiscordMessage(`เอาเยอะนะเราอ่ะ เป็นแค่ ${userRole} เองนิ`);

        // get the other user id from the query url
        const { id } = req.query;
        const queryId = parseInt(typeof id === "string" ? id : "-1")

        try {
            // must not add relationship with themself
            if (userId === queryId) {
                throw new Error("u cannot have a relationship with yourself here");
            }

            // validate first if the other user exists
            await prisma.user.findFirstOrThrow({
                where: {
                    id: queryId,
                }
            });

            // extract the friendship action from thee payload
            const { action } = req.body as friendshipMutationInput;
            friendshipMutationSchema.parse({ action });

            // determine the friendship state between the two users
            const status = await getFriendshipState(userId, queryId);

            // sanity check
            if (status === undefined) {
                throw new Error("error determining friendship status: friendship status undefined")
            }

            // check if the action is allowed
            if (!actionIsAllowed(status, action)) {
                return res
                    .status(405)
                    .json({ message: `action ${action} is not allowed for status ${status}` });
            }

            // do the action & update the friendship status
            const updatedStatus = await mutateFriendship(userId, queryId, status, action);

            return res
                .status(200)
                .json({ message: `user ${userId} successfully ${action} friend to user ${queryId}`, previous_friendship_status: status, current_friendship_status: updatedStatus });

        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ message: `${error}` });
        }
    } else {
        return res
            .status(405)
            .json({ message: "only POST supported อยากเป็นสร้างหรือทำลายความสัมพันธ์ก็ยิง POST มาสิเฟ่ยยย" });
    }
}

export default handler;

const getFriendshipState = async (me: number, you: number): Promise<FriendshipStatus | undefined> => {
    try {
        const outgoing = await prisma.friendRequest.findFirst({
            where: {
                fromUserId: me,
                toUserId: you,
            }
        });

        const incoming = await prisma.friendRequest.findFirst({
            where: {
                fromUserId: you,
                toUserId: me,
            }
        });

        console.log("----------------------------");
        console.log("me", me);
        console.log("you", you);
        console.log("outgoing", outgoing);
        console.log("incoming", incoming);
        console.log("----------------------------");

        let status: FriendshipStatus;

        if (outgoing === null && incoming === null) status = FriendshipStatus.NEUTRAL;
        else if (outgoing !== null && incoming === null) status = FriendshipStatus.OUTGOING;
        else if (outgoing === null && incoming !== null) status = FriendshipStatus.INCOMING;
        else status = FriendshipStatus.FRIENDLY;

        console.log(status);

        return status;

    } catch (error) {
        console.log(error);
    }
};

const actionIsAllowed = (status: FriendshipStatus, action: friendshipMutationActionT): boolean => {
    const allowedFriendshipActions: { [key in FriendshipStatus]: friendshipMutationActionT[] } = {
        [FriendshipStatus.NEUTRAL]: [friendshipMutationAction.Enum.ADD],
        [FriendshipStatus.OUTGOING]: [],
        [FriendshipStatus.INCOMING]: [friendshipMutationAction.Enum.ADD],
        [FriendshipStatus.FRIENDLY]: [friendshipMutationAction.Enum.REMOVE],
    };

    if (!allowedFriendshipActions[status].includes(action)) {
        return false;
    }
    return true;
}

const mutateFriendship = async (me: number, you: number, currentStatus: FriendshipStatus, action: friendshipMutationActionT): Promise<FriendshipStatus> => {
    let updatedStatus: FriendshipStatus;
    switch (action) {
        case "ADD":
            // add an outgoing request
            await prisma.friendRequest.create({
                data: {
                    fromUserId: me,
                    toUserId: you,
                }
            });

            // NEUTRAL -> OUTGOING
            // OUTGOING -> FRIENDLY
            if (currentStatus === FriendshipStatus.NEUTRAL) {
                updatedStatus = FriendshipStatus.OUTGOING;
            } else {
                updatedStatus = FriendshipStatus.FRIENDLY;
            }
            break;

        case "REMOVE":
            // remove both outgoing & incoming requests
            await prisma.friendRequest.deleteMany({
                where: {
                    OR: [{
                        fromUserId: me,
                        toUserId: you,
                    },
                    {
                        fromUserId: you,
                        toUserId: me,
                    },
                    ]
                }
            });
            updatedStatus = FriendshipStatus.NEUTRAL;
            break;
    }
    return updatedStatus;
}