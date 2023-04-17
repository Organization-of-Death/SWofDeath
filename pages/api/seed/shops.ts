import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { prisma } from '@/prisma/utils';

const { uniqueNamesGenerator, adjectives, animals, countries } = require('unique-names-generator');

type Data = {
    message: string;
};

// Seed 10 shops for you
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    if (req.method === 'POST') {
        const seedNo = 10;

        await prisma.massageShop.deleteMany();

        for (let i = 0; i < seedNo; i++) {
            const randomShopName: string = uniqueNamesGenerator({
                dictionaries: [adjectives, animals],
                style: 'lowerCase',
            });

            const randomAddress: string = uniqueNamesGenerator({
                dictionaries: [animals, countries],
            })

            const randomPhoneNumber: string = getRandomInt(10000, 99999).toString();

            const [openTime, closeTime] = generateRandomOpeningHours();
            try {
                await prisma.massageShop.create({
                    data: {
                        name: randomShopName,
                        address: randomAddress,
                        phoneNumber: randomPhoneNumber,
                        openTime: openTime,
                        closeTime: closeTime,
                    }
                });
            } catch (e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    if (e.code === 'P2002') {
                        console.log('same shop name, rerandomizing');
                        i--;
                    }
                } else {
                    console.log("error : ", e);
                }
            }
        }

        res.status(200).json({ message: `seeded ${seedNo} shops success` });
    } else {
        res.status(405).json({ message: 'only POST is supported' });
    }
}

// generate a random shop opening hours. the shop can open from 1 to 24 (all day) hours starting at every hour of the day.
function generateRandomOpeningHours(): [number, number] {
    const openTime = getRandomInt(0, 23);

    const totalOpenHours = getRandomInt(1, 24);
    if (totalOpenHours === 24) {
        return [0, 0];
    }
    const closeTime = (openTime + totalOpenHours) % 24;
     return [openTime, closeTime];
}

// Helper function to generate a random integer between min and max (inclusive)
function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}