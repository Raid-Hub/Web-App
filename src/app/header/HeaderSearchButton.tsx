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
            className="bg-background text-muted-foreground flex cursor-pointer items-center space-x-2 rounded-md border-1 px-2 py-1"
            onClick={() => setOpen(true)}>
            <Search className="size-4" />

            {userAgent && (
                <div className="max-tablet:hidden space-x-1 text-base font-light select-none">
                    <kbd className="rounded bg-zinc-800 px-1">{OSKey}</kbd>
                    <kbd className="rounded bg-zinc-800 px-1">K</kbd>
                </div>
            )}
        </div>
    )
}
