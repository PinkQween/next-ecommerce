import { DiscountCodeType, Product } from "@prisma/client";

export default interface CheckoutFormProps {
    product: Product;
    coupon?: {
        id: string;
        discountAmount: number;
        discountType: DiscountCodeType;
    }
}