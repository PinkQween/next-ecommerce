import db from "@/db/db";
import PurchaseReceiptEmail from "@/email/PurchaseReceipt";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import Stripe from "stripe";
// import PurchaseReceiptEmail from '@/email/PurchaseReceipt';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

export const POST = async (req: NextRequest) => {
    console.log("received");

    const event = await stripe.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") as string, process.env.STRIPE_WEBHOOK_SECRET as string);
    if (event.type === "charge.succeeded") {
        const charge = event.data.object;
        const productId = charge.metadata.productId;
        const email = charge.billing_details.email;
        const price = charge.amount;

        const product = await db.product.findUnique({
            where: {
                id: productId,
            }
        });

        if (product == null || email == null) return new NextResponse("Bad request", {
            status: 400,
        });



        const userFields = {
            email,
            orders: {
                create: {
                    productId,
                    pricePaidInCents: price,
                }
            }
        }

        const { orders: [order] } = await db.user.upsert({
            where: {
                email
            },
            create: userFields,
            update: userFields,
            select: {
                orders: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        });

        const downloadVerification = await db.downloadVerification.create({
            data: {
                productId,
                expiresAt: new Date(Date.now() + 1000 * 60 * 10)
            }
        });

        console.log('ready email');

        const { data, error } = await resend.emails.send({
            from: `No Reply <${process.env.NO_REPLY_ADDRESS}>`,
            to: email,
            subject: "Order confirmed",
            react: (
                <PurchaseReceiptEmail
                    order={order}
                    product={product}
                    downloadVerificationId={downloadVerification.id}
                />
            ),
        });

        console.log(error);
        console.log(data);
    }

    return new NextResponse();
}