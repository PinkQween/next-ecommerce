import { DiscountCodeType } from "@prisma/client";

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    minimumFractionDigits: 0,
});

export const formatCurrency = (amount: number) => {
    return CURRENCY_FORMATTER.format(amount);
}

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

export const formatNumber = (amount: number) => {
    return NUMBER_FORMATTER.format(amount);
}

const PERCENT_FORMATTER = new Intl.NumberFormat("en-US", { style: "percent" })


export const formatDiscountCode = ({ discountAmount, discountType }: { discountAmount: number, discountType: DiscountCodeType }) => {
    switch (discountType) {
        case "PERCENTAGE":
            return PERCENT_FORMATTER.format(discountAmount / 100);
        case "FIXED":
            return formatCurrency(discountAmount);
    }
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
})

export function formatDateTime(date: Date) {
    return DATE_TIME_FORMATTER.format(date)
}