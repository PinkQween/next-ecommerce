"use server"

import db from "@/db/db"

export const userOrderExists = async (email: string, id: string) => {
    return (await db.order.findFirst({
        where: {
            user: {
                email,
            },
            productId: id,
        },
        select: {
            id: true,
        }
    })) != null
}