import { PageHeader } from "@/components/PageHeader"
import { DiscountCodeForm } from "@/components/DiscountCodeForm"
import db from "@/db/db"

const NewDiscountCodePage = async () => {
    const products = await db.product.findMany({
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: 'asc'
        }
    })

    return (
        <>
            <PageHeader>Add Coupon</PageHeader>
            <DiscountCodeForm products={products} />
        </>
    )
}

export default NewDiscountCodePage