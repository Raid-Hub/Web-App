"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import { useLocale } from "~/components/providers/LocaleManager"
import { usePlayerSearch } from "~/hooks/usePlayerSearch"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"
import { type RaidHubPlayerInfo } from "~/services/raidhub/types"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "~/shad/command"
import { bungieProfileIconUrl, getBungieDisplayName } from "~/util/destiny"
import { formattedTimeSince } from "~/util/presentation/formatting"
import { useSearchContext } from "./search-provider"

type SearchStore = {
    searchDate: string
} & RaidHubPlayerInfo

const defaultRecentSearchValue: SearchStore[] = []

export function SearchCommand() {
    const [open, setOpen] = useSearchContext()
    const { value, setValue, clearQuery, results, isLoading, debouncedQuery } = usePlayerSearch()
    const [recentResults, setRecentResults] = useLocalStorage(
        "recentPlayerSearchesV2",
        defaultRecentSearchValue
    )
    const router = useRouter()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen(open => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => {
            document.removeEventListener("keydown", down)
        }
    }, [setOpen])

    const createSelectHandler = useCallback(
        (player: Omit<SearchStore, "searchDate">) => () => {
            router.push(`/profile/${player.membershipId}`)
            setOpen(false)
            setRecentResults(prev => {
                const filtered = prev.filter(p => p.membershipId !== player.membershipId)
                filtered.unshift({ ...player, searchDate: new Date().toISOString() })
                return filtered.slice(0, 6)
            })
            clearQuery()
        },
        [clearQuery, setOpen, setRecentResults, router]
    )

    return (
        <CommandDialog
            title="Search for a Guardian"
            description="Enter a Guardian's Bungie Name"
            open={open}
            onOpenChange={setOpen}
            className="rounded-lg border shadow-md md:min-w-[450px]"
            shouldFilter={false}>
            <CommandInput
                placeholder="Enter a Guardian's Bungie Name"
                value={value}
                onValueChange={setValue}
                loading={isLoading}
            />
            <CommandList className="h-100 max-h-100">
                {!isLoading && !!debouncedQuery && <CommandEmpty>No players found</CommandEmpty>}
                {!value && !!recentResults.length && (
                    <>
                        <CommandGroup heading="Recent Searches">
                            {recentResults.map(player => (
                                <PlayerCommandItem
                                    key={player.membershipId}
                                    player={player}
                                    date={new Date(player.searchDate)}
                                    handleSelect={createSelectHandler(player)}
                                />
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                )}

                {!!results.size && (
                    <CommandGroup heading="Results">
                        {results.map(player => {
                            return (
                                <PlayerCommandItem
                                    key={player.membershipId}
                                    player={player}
                                    date={player.lastSeen ? new Date(player.lastSeen) : null}
                                    handleSelect={createSelectHandler(player)}
                                />
                            )
                        })}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    )
}

const PlayerCommandItem = ({
    player,
    date,
    handleSelect
}: {
    player: Omit<RaidHubPlayerInfo, "lastSeen">
    date: Date | null
    handleSelect: () => void
}) => {
    const { locale } = useLocale()

    return (
        <CommandItem
            className="gap-3"
            key={player.membershipId}
            value={`${player.bungieGlobalDisplayName}#${player.bungieGlobalDisplayNameCode}:${player.membershipId}`}
            onSelect={() => {
                handleSelect()
            }}
            asChild>
            <Link href={`/profile/${player.membershipId}`}>
                <Image
                    src={bungieProfileIconUrl(player.iconPath)}
                    alt={getBungieDisplayName(player)}
                    className="size-8 rounded-sm"
                    unoptimized
                    width={96}
                    height={96}
                />
                <div>
                    <div>
                        {player.bungieGlobalDisplayName}
                        <span className="text-muted-foreground">
                            #{player.bungieGlobalDisplayNameCode}
                        </span>
                    </div>
                    {date && (
                        <div className="text-muted-foreground text-xs">
                            {formattedTimeSince(date, locale)}
                        </div>
                    )}
                </div>
            </Link>
        </CommandItem>
    )
}
