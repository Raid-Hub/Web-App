"use client"

import { Search } from "lucide-react"
import { useSearchContext } from "../search/search-provider"

export const HomeSearchButton = () => {
    const [, setOpen] = useSearchContext()
    return (
        <div
            className="text-muted-foreground hover:border-raidhub/30 bg-background/80 mx-auto flex h-12 max-w-120 cursor-pointer items-center gap-2 rounded-md border-1 p-2 text-sm"
            onClick={e => {
                e.preventDefault()
                setOpen(true)
            }}>
            <Search className="size-6" />
            Search for a Guardian
        </div>
    )
}
