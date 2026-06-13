"use client"

import { Search } from "lucide-react"
import { useSearchContext } from "../search/search-provider"

export const HomeSearchButton = () => {
    const [, setOpen] = useSearchContext()
    return (
        <div
            className="text-muted-foreground border-border/60 bg-background/40 hover:border-raidhub/40 mx-auto flex h-10 w-full max-w-md cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors"
            onClick={e => {
                e.preventDefault()
                setOpen(true)
            }}>
            <Search className="size-4 shrink-0" />
            Search for a Guardian
        </div>
    )
}
