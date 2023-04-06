import type { NextApiRequest, NextApiResponse } from 'next';
import { MassageShop, Reservation, Role } from "@prisma/client";
import { prisma } from '@/prisma/utils';

type MassageShopData = {
    message: String;
    total?: number;
    data?: MassageShop[];
};

async function handler(req: NextApiRequest, res: NextApiResponse<MassageShopData>) {

    if (req.method === 'GET') {
        const massageShops = await prisma.massageShop.findMany();
        return res.status(200).json({ message: "successfully retrieved massage shops", total: massageShops.length, data: massageShops });
    } else {
        return res.status(405).json({ message: "method not supported" });
    }
}

export default handler