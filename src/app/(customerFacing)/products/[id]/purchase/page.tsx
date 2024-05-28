import { CheckoutForm } from "@/components/CheckoutForm";
import db from "@/db/db";
import { useableDiscountCodeWhere } from "@/lib/discountCodeHelper";
import { notFound } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const PurchasePage = async ({ params: { id }, searchParams: { coupon }}: { params: { id: string }, searchParams: { coupon?: string } }) => {
    const product = await db.product.findUnique({
        where: { id },
    });

    if (product == null) return notFound();
    
    const discountCode = coupon == null ? undefined : await getCode(coupon, product.id);

    return (
        <CheckoutForm product={product} coupon={discountCode || undefined} />
    )
}

export default PurchasePage;

const getCode = async (code: string, productID: string) => {
    return db.discountCode.findUnique({
        select: {
            id: true,
            discountAmount: true,
            discountType: true,
        },
        where: { ...useableDiscountCodeWhere, code },
    });
}