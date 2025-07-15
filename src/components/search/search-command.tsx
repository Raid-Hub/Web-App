"use client"

import Image from "next/image"
import { usePlayerSearch } from "~/hooks/usePlayerSearch"

import Link from "next/link"
import { useEffect } from "react"
import { useLocale } from "~/components/providers/LocaleManager"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"
import { useRaidHubResolvePlayer } from "~/services/raidhub/useRaidHubResolvePlayer"
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

const defaultRecentSearchValue: string[] = []

export function SearchCommand() {
    const [open, setOpen] = useSearchContext()
    const { value, setValue, clearQuery, results, isLoading, debouncedQuery } = usePlayerSearch()
    const [recentResults, setRecentResults] = useLocalStorage(
        "recentPlayerSearches",
        defaultRecentSearchValue
    )

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

    const createSelectHandler = (membershipId: string) => () => {
        setOpen(false)
        setRecentResults(prev => {
            const filtered = prev.filter(p => p !== membershipId)
            filtered.unshift(membershipId)
            return filtered.slice(0, 6)
        })
        clearQuery()
    }

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
                            {recentResults.map(membershipId => (
                                <PlayerCommandItem
                                    key={membershipId}
                                    membershipId={membershipId}
                                    handleSelect={createSelectHandler(membershipId)}
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
                                    membershipId={player.membershipId}
                                    handleSelect={createSelectHandler(player.membershipId)}
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
    membershipId,
    handleSelect
}: {
    membershipId: string
    handleSelect: () => void
}) => {
    const { locale } = useLocale()
    const { data: player } = useRaidHubResolvePlayer(membershipId, {
        placeholderData: {
            membershipId,
            iconPath: "",
            bungieGlobalDisplayName: "",
            bungieGlobalDisplayNameCode: "",
            lastSeen: "0",
            membershipType: 0,
            displayName: "",
            isPrivate: false,
            cheatLevel: 0
        }
    })

    if (!player) return null

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
                    <div className="text-muted-foreground text-xs">
                        {formattedTimeSince(new Date(player.lastSeen), locale)}
                    </div>
                </div>
            </Link>
        </CommandItem>
    )
}
