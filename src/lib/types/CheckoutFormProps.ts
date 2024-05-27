import { Product } from "@prisma/client";

export default interface CheckoutFormProps {
    product: Product;
    clientSecret: string;
}