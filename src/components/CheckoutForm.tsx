"use client"

import { formatCurrency } from "@/lib/formatters";
import CheckoutFormProps from "@/lib/types/CheckoutFormProps";
import { Elements, LinkAuthenticationElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "./ui/button";
import { FormEvent, useState } from "react";

const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

export const CheckoutForm = ({ product, clientSecret }: CheckoutFormProps) => {
    return (
        <div className="max-w-5xl w-full mx-auto space-y-8">
            <div className="flex gap-4 items-center">
                <div className="aspect-video flex-shrink-0 w-1/2 relative">
                    <Image src={product.imagePath} fill alt={product.name} className="object-fill" />
                </div>
                <div>
                    <div className="text-lg">
                        {formatCurrency(product.priceInCents / 100)}
                    </div>
                    <h1 className="text-2xl font-bold">
                        {product.name}
                    </h1>
                    <div className="line-clamp-3 text-muted-foreground">
                        {product.description}
                    </div>
                </div>
            </div>

            <Elements options={{ clientSecret }} stripe={stripe}>
                <Form price={product.priceInCents} />
            </Elements>
        </div>
    )
}

const Form = ({ price }: { price: number}) => {
    const stripe = useStripe();
    const elements = useElements();

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (stripe == null || elements == null) return;

        setIsLoading(true);

        // TODO: check if already owned


        stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe/purchase-success`,
            }
        }).then(({ error }) => {
            if (error.type === "card_error" || error.type === "validation_error") {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("An unknown error occurred. Please try again later.");
                setErrorMessage(error.message);
            }
        }).finally(() => {
            setIsLoading(false);
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                    {errorMessage && <CardDescription className="text-destructive">{errorMessage}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <PaymentElement />
                    <div className="mt-4">
                        <LinkAuthenticationElement />
                    </div>
                </CardContent>
                <CardFooter>
                    {/* <Button className="w-full" size='lg' disabled={stripe == null || elements == null || isLoading}>{isLoading ? "Purchasing" : `Purchase - ${formatCurrency(price / 100)}`}</Button> */}
                    <Button className="w-full" size='lg'>{isLoading ? "Purchasing" : `Purchase - ${formatCurrency(price / 100)}`}</Button>
                </CardFooter>
            </Card>
        </form>
    )
}