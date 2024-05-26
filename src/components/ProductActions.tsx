"use client"

import { deleteProduct, toggleProductAvailability } from "@/app/admin/_actions/products"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

export const ActivateToggleDropdownItem = ({ id, isAvailableForPurchase }: { id: string, isAvailableForPurchase: boolean }) => {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    return (
        <DropdownMenuItem disabled={isPending} onClick={() => {
            startTransition(async () => {
                await toggleProductAvailability(id, !isAvailableForPurchase);
                router.refresh();
            });
        }}>
            {isAvailableForPurchase? "Deactivate" : "Activate" }
        </DropdownMenuItem>
    )
}

export const DeleteDropdownItem = ({ id, disabled }: { id: string, disabled: boolean }) => {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    return (
        <DropdownMenuItem variant="destructive" disabled={disabled || isPending} onClick={() => {
            startTransition(async () => {
                await deleteProduct(id);
                router.refresh();
            });
        }}>
            Delete
        </DropdownMenuItem>
    )
}