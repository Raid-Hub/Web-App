"use client"

import { Search } from "lucide-react"
import { useLocale } from "~/components/providers/LocaleManager"
import { useSearchContext } from "~/components/search/search-provider"

export default function SearchBar() {
    const { userAgent } = useLocale()
    const [, setOpen] = useSearchContext()
    const OSKey = userAgent.device.vendor?.toLowerCase().includes("apple") ? "⌘" : "ctrl"

    return (
        <div
            className="bg-background text-muted-foreground flex h-8 cursor-pointer items-center gap-2 rounded-md border-1 px-2 py-1"
            onClick={() => setOpen(true)}>
            <Search className="size-4" />

            {userAgent && (
                <div className="space-x-1 text-base font-light select-none max-md:hidden">
                    <kbd className="rounded bg-zinc-800 px-1">{OSKey}</kbd>
                    <kbd className="rounded bg-zinc-800 px-1">K</kbd>
                </div>
            )}
        </div>
    )
}
