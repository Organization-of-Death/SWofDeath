import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma, PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const { uniqueNamesGenerator, adjectives, animals, names } = require('unique-names-generator');
const prisma = new PrismaClient();

type Data = {
    message: string;
};

// Seed 10 USERS & 10 ADMIN
// password will be randomUserName

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    if (req.method === 'GET') {
        const seedNo = 10;

        await prisma.user.deleteMany();

        for (let i = 0; i < seedNo * 2; i++) {
            const randomUserName: string = uniqueNamesGenerator({
                dictionaries: [names],
                style: 'lowerCase',
            });

            // Generate salt
            const salt = await bcrypt.genSalt(10);

            // Use salt to hash password
            const hashedPassword = await bcrypt.hash(randomUserName, salt);

            try {
                await prisma.user.create({
                    data: {
                        email: `${randomUserName}@mail.com`,
                        password: hashedPassword,
                        name: randomUserName,
                        role: (i < seedNo ? Role.USER : Role.ADMIN),
                        salt: salt
                    }
                });
            } catch (e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    if (e.code === 'P2002') {
                        console.log('same email address, rerandomizing');
                        i--;
                    }
                } else {
                    console.log("error : ", e);
                }
            }
        }

        res.status(200).json({ message: `seeded ${seedNo} users & admins success` });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}