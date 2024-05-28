"use server"

import db from "@/db/db";
import OrderHistoryEmail from "@/email/OrderHistory";
import { getDiscountedAmount, useableDiscountCodeWhere } from "@/lib/discountCodeHelper";
import { Resend } from "resend";
import { z } from "zod";
import Stripe from "stripe"

const emailSchema = z.string().email();
const resend = new Resend(process.env.RESEND_API_KEY as string);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

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

export const createPaymentIntent = async (
    email: string,
    productId: string,
    discountCodeId?: string
) => {
    const product = await db.product.findUnique({ where: { id: productId } })
    if (product == null) return { error: "Unexpected Error" }

    const discountCode =
        discountCodeId == null
            ? null
            : await db.discountCode.findUnique({
                where: { id: discountCodeId, ...useableDiscountCodeWhere(product.id) },
            })

    if (discountCode == null && discountCodeId != null) {
        return { error: "Coupon has expired" }
    }

    const existingOrder = await db.order.findFirst({
        where: { user: { email }, productId },
        select: { id: true },
    })

    if (existingOrder != null) {
        return {
            error:
                "You have already purchased this product. Try downloading it from the My Orders page",
        }
    }

    const amount =
        discountCode == null
            ? product.priceInCents
            : getDiscountedAmount(discountCode, product.priceInCents)

    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "USD",
        metadata: {
            productId: product.id,
            discountCodeId: discountCode?.id || null,
        },
    })

    if (paymentIntent.client_secret == null) {
        return { error: "Unknown error" }
    }

    return { clientSecret: paymentIntent.client_secret }
}