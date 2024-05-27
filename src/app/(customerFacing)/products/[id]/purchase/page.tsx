import { CheckoutForm } from "@/components/CheckoutForm";
import db from "@/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const PurchasePage = async ({ params: { id }}: { params: { id: string }}) => {
    const product = await db.product.findUnique({
        where: { id },
    });

    if (product == null) return notFound();
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: product.priceInCents,
        currency: "usd",
        metadata: { productId: product.id },
    });

    if (paymentIntent.client_secret == null) throw new Error("Stripe failed to create payment intent");

    return (
        <CheckoutForm product={product} clientSecret={paymentIntent.client_secret} />
    )
}

export default PurchasePage;