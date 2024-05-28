import db from "@/db/db"
import { DiscountCodeType, Prisma } from "@prisma/client";

export const useableDiscountCodeWhere = (productId: string) => {
    return {
        isActive: true,
        AND: [
            {
                OR: [
                    {
                        allProducts: true,
                    },
                    {
                        products: {
                            some: {
                                id: productId,
                            }
                        }
                    }
                ]
            },
            {
                OR: [
                    {
                        limit: null,
                    },
                    {
                        limit: {
                            gt: db.discountCode.fields.uses,
                        }
                    }
                ]
            },
            {
                OR: [
                    {
                        expiresAt: null,
                    },
                    {
                        expiresAt: {
                            gt: new Date(),
                        }
                    }
                ]
            }
        ]
    } satisfies Prisma.DiscountCodeWhereInput;
}

export const getDiscountedAmount = (discountCode: { discountAmount: number, discountType: DiscountCodeType}, price: number) => {
    switch(discountCode.discountType) {
        case "PERCENTAGE":
            return Math.max(1, Math.ceil(price - price * discountCode.discountAmount / 100))
        case "FIXED":
            return Math.max(1, Math.ceil(price - discountCode.discountAmount * 100))
    }
}