"use client"

import { formatCurrency, formatDiscountCode } from "@/lib/formatters";
import CheckoutFormProps from "@/lib/types/CheckoutFormProps";
import { Elements, LinkAuthenticationElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormEvent, useRef, useState } from "react";
import { userOrderExists } from "@/lib/orders";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { DiscountCodeType } from "@prisma/client";
import { getDiscountedAmount } from "@/lib/discountCodeHelper";
import { createPaymentIntent } from "@/actions/orders";

const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

export const CheckoutForm = ({ product, coupon }: CheckoutFormProps) => {
    const amount = coupon == null ? product.priceInCents : getDiscountedAmount(coupon, product.priceInCents);
    const isDiscounted = amount !== product.priceInCents;
    
    return (
        <div className="max-w-5xl w-full mx-auto space-y-8">
            <div className="flex gap-4 items-center">
                <div className="aspect-video flex-shrink-0 w-1/2 relative">
                    <Image src={product.imagePath} fill alt={product.name} className="object-cover" />
                </div>
                <div>
                    <div className="text-lg flex gap-4 items-baseline">
                        <div
                            className={
                                isDiscounted ? "line-through text-muted-foreground text-sm" : ""
                            }
                        >
                            {formatCurrency(product.priceInCents / 100)}
                        </div>
                        {isDiscounted && (
                            <div className="">{formatCurrency(amount / 100)}</div>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold">
                        {product.name}
                    </h1>
                    <div className="line-clamp-3 text-muted-foreground">
                        {product.description}
                    </div>
                </div>
            </div>

            <Elements options={{ amount, mode: "payment", currency: "usd" }} stripe={stripe}>
                <Form price={amount} prodId={product.id} discountCode={coupon ? { id: coupon.id, amount: coupon.discountAmount, discountType: coupon.discountType } : undefined} />
            </Elements>
        </div>
    )
}

const Form = ({ price, prodId, discountCode}: { price: number, prodId: string, discountCode?: { id: string, amount: number, discountType: DiscountCodeType} }) => {
    const ref = useRef<HTMLInputElement>(null)
    const stripe = useStripe();
    const elements = useElements();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const coupon = searchParams.get("coupon");

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    const [email, setEmail] = useState<string>();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (stripe == null || elements == null || email == null) return;

        setIsLoading(true);

        const formSubmit = await elements.submit()

        if (formSubmit.error != null) {
            setErrorMessage(formSubmit.error.message);
            setIsLoading(false);
            return;
        }
        
        const paymentIntent = await createPaymentIntent(
            email,
            prodId,
            discountCode?.id
        )
        if (paymentIntent.error != null) {
            setErrorMessage(paymentIntent.error)
            setIsLoading(false)
            return
        }

        stripe
            .confirmPayment({
                elements,
                clientSecret: paymentIntent.clientSecret,
                confirmParams: {
                    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe/purchase-success`,
                },
            })
            .then(({ error }) => {
                if (error.type === "card_error" || error.type === "validation_error") {
                    setErrorMessage(error.message)
                } else {
                    setErrorMessage("An unknown error occurred")
                    setErrorMessage(error.message)
                }
            })
            .finally(() => setIsLoading(false))
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                    <CardDescription className="text-destructive">
                        {errorMessage && <div>{errorMessage}</div>}
                        {coupon != null && discountCode == null && (
                            <div>Invalid discount code</div>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PaymentElement />
                    <div className="mt-4">
                        <LinkAuthenticationElement onChange={e => setEmail(e.value.email)} />
                    </div>
                    <div className="space-y-2 mt-4">
                        <Label htmlFor="discount">Coupon</Label>
                        <div className="flex gap-4 items-center">
                            
                            <Input type="text" name="discount" id="discount" className="max-w-xs w-full" ref={ref} defaultValue={searchParams.get("coupon") || ""}></Input>
                            <Button type="button" onClick={() => {
                                const params = new URLSearchParams(searchParams);
                                params.set("coupon", ref.current?.value || "");
                                router.push(`${pathname}?${params.toString()}`)
                            }}>Apply</Button>
                            {discountCode != null && (
                                <div className="text-muted-foreground">
                                    {formatDiscountCode({ discountAmount: discountCode.amount, discountType: discountCode.discountType })} discount
                                </div>
                            )}
                            </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" size='lg' disabled={stripe == null || elements == null || isLoading}>{isLoading ? "Purchasing" : `Purchase - ${formatCurrency(price / 100)}`}</Button>
                </CardFooter>
            </Card>
        </form>
    )
}