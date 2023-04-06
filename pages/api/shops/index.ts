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
        const page_no = parseInt(typeof req.query.page_no === "string" ? req.query.page_no : "0");
        const page_size = parseInt(typeof req.query.page_size === "string" ? req.query.page_size : "10");

        const skip = page_no * page_size;
        const massageShops = await prisma.massageShop.findMany({
            skip,
            take: page_size,
        });
        return res.status(200).json({ message: "successfully retrieved massage shops", total: massageShops.length, data: massageShops });
    } else {
        return res.status(405).json({ message: "method not supported" });
    }
}

export default handler