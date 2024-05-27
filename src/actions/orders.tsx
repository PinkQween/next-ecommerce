"use server"

import db from "@/db/db";
import OrderHistoryEmail from "@/email/OrderHistory";
import { Resend } from "resend";
import { z } from "zod";

const emailSchema = z.string().email();
const resend = new Resend(process.env.RESEND_API_KEY as string);

const message = "Check your email to view your order history and download your products"

const emailOrderHistory = async (_: unknown, formData: FormData): Promise<{ message?: string; error?: string}> => {
    const result = emailSchema.safeParse(formData.get("email"));

    if (result.success === false) {
        return { error: "Invalid email" };
    }

    const user = await db.user.findUnique({
        where: {
            email: result.data
        },
        select: {
            email: true,
            orders: {
                select: {
                    pricePaidInCents: true,
                    id: true,
                    createdAt: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            imagePath: true,
                            description: true
                        }
                    }
                }
            }
        }
    });

    if (user == null) {
        return {
            message
        }
    }

    const orders = user.orders.map(async order => {
        return {
            ...order,
            downloadVerificationId: (await db.downloadVerification.create({
                data: {
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 24),
                    productId: order.product.id
                }
            })).id
        }
    })

    const data = await resend.emails.send({
        from: `No Reply <${process.env.NO_REPLY_ADDRESS}>`,
        to: user.email,
        subject: "Order history",
        react: (
            <OrderHistoryEmail orders={await Promise.all(orders)} />
        ),
    });

    if (data.error) {
        return { error: "Error sending email, try again later" };
    }

    return { message }
}

export default emailOrderHistory;