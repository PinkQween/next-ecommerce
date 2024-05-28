import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import db from "@/db/db";
import ProductGridSectionProps from '@/lib/types/ProductGridSectionProps';
import { Product } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { cache } from "@/lib/cache";
import { RANGE_OPTIONS, getRangeOption } from "@/lib/rangeOptions"
import { RevenueByProductChart } from ".@/components/ui/RevenueByProductChart"

const getMostPopular = cache(() => {
    return db.product.findMany({
        where: { isAvailableForPurchase: true },
        orderBy: { orders: { _count: 'desc' } },
        take: 6
    })
}, ["/", "getMostPopular"], { revalidate: 60 * 60 * 24 })

const getNewest = cache(() => {
    return db.product.findMany({
        where: { isAvailableForPurchase: true },
        orderBy: { createdAt: 'desc' },
        take: 6
    })
}, ["/", "getNewest"]);

const Home = () => {
    return (
        <main className="space-y-12">
            <ProductGridSection productsFetcher={getMostPopular} title="Most Popular" />
            <ProductGridSection productsFetcher={getNewest} title="Newest" />
        </main>
    );
}

export default Home

const ProductGridSection = async ({ productsFetcher, title }: ProductGridSectionProps) => {
    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold">{title}</h2>
                <Button variant="outline" asChild>
                    <Link href="/products" className="space-x-2">
                        <span>View All</span>
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Suspense
                    fallback={
                        <>
                            <ProductCardSkeleton />
                            <ProductCardSkeleton />
                            <ProductCardSkeleton />
                        </>
                    }
                >
                    <ProductSuspense productsFetcher={productsFetcher} />
                </Suspense>
            </div>
        </div>
    )
}

const ProductSuspense = async ({ productsFetcher }: { productsFetcher: () => Promise<Product[]> }) => {
    return (await productsFetcher()).map((product) => (
        <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.priceInCents}
            description={product.description}
            imagePath={product.imagePath}
        />
    ))
}