import { unstable_cache as nextCache } from "next/cache"
import { cache as reactCache } from "react"
import type Callback from "@/lib/types/Callback"

export const cache = <T extends Callback>(callback: T, keyParts: string[], options: { revalidate?: number | false; tags?: string[] } = {}) => {
    return nextCache(reactCache(callback), keyParts, options);
}