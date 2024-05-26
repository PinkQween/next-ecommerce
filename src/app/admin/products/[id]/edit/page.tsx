import { PageHeader } from "@/components/PageHeader"
import { ProductForm } from "@/components/ProductFrom"
import db from "@/db/db"

const NewProductPage = async ({ params: { id }}: { params: { id: string } }) => {
    const product = await db.product.findUnique({ where: { id }});
    
    return (
        <>
            <PageHeader>Edit Product</PageHeader>
            <ProductForm product={product} />
        </>
    )
}

export default NewProductPage