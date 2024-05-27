import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard"
import db from "@/db/db"
import { cache } from "@/lib/cache"
import { Product } from "@prisma/client"
import { Suspense } from "react"

const getProducts = cache(() => {
    return db.product.findMany({
        where: { isAvailableForPurchase: true },
    })
}, ["/products", "getProducts"])

const ProductsPage = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Suspense
                fallback={
                    <>
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                    </>
                }
            >
                <ProductSuspense productsFetcher={getProducts} />
            </Suspense>
        </div>
    )
}

export default ProductsPage;

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