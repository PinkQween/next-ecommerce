import { Product } from "@prisma/client";

export default interface ProductGridSectionProps {
    productsFetcher: () => Promise<Product[]>;
    title: string;
}