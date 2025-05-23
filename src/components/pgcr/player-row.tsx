"use client"

import { ChevronRight, SquareArrowLeft } from "lucide-react"
import Link from "next/link"
import { ActivityPieChart } from "~/components/pgcr/activity-pie-chart"
import { useItemDefinition } from "~/hooks/dexie"
import { usePGCRContext } from "~/hooks/pgcr/ClientStateManager"
import { useGetCharacterClass } from "~/hooks/pgcr/useCharacterClass"
import { cn } from "~/lib/tw"
import { type RaidHubInstancePlayerExtended } from "~/services/raidhub/types"
import { Avatar, AvatarFallback, AvatarImage } from "~/shad/avatar"
import { Button } from "~/shad/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/shad/tooltip"
import { bungieBannerEmblemUrl, bungieProfileIconUrl, getBungieDisplayName } from "~/util/destiny"
import { round } from "~/util/math"
import { secondsToHMS } from "~/util/presentation/formatting"
import { PlayerBadge } from "./player-badge"

interface PlayerRowProps {
    player: RaidHubInstancePlayerExtended
}

export default function PlayerRow({ player }: PlayerRowProps) {
    const { data, playerStatsMerged, mvp, query } = usePGCRContext()

    const stats = playerStatsMerged.get(player.playerInfo.membershipId)!
    const timePlayed = Math.min(stats.timePlayedSeconds, data.duration)
    const activityPercentage = round(100 * (timePlayed / data.duration), 0)

    const displayName = getBungieDisplayName(player.playerInfo, { excludeCode: true })

    const emblemDefinition = useItemDefinition(player.characters[0].emblemHash ?? 0)

    const getCharacterIcon = useGetCharacterClass()

    // player.completed ? "opacity-25 md:opacity-10" : "opacity-15 md:opacity-5"
    return (
        <Button
            variant="ghost"
            className="group relative h-16 w-full max-w-full cursor-pointer rounded-none p-0 hover:bg-zinc-900"
            onClick={() => query.set("player", player.playerInfo.membershipId)}>
            <TooltipProvider>
                <div
                    className={cn(
                        "absolute inset-0 bg-[left_2%_center]",
                        player.completed ? "opacity-20" : "opacity-5 grayscale"
                    )}
                    style={
                        emblemDefinition
                            ? {
                                  backgroundImage: `url(${bungieBannerEmblemUrl(emblemDefinition)})`
                              }
                            : undefined
                    }
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.9)]" />

                <Link
                    className="z-10 flex h-full min-w-0 flex-1 overflow-hidden transition-[min-width] duration-500 ease-out group-hover:min-w-16"
                    href={`/profile/${player.playerInfo.membershipId}`}
                    onClick={e => e.stopPropagation()}>
                    <div className="bg-foreground/20 flex w-full flex-col items-center justify-center rounded-r-2xl border-r border-zinc-800 px-3 backdrop-blur-md">
                        <SquareArrowLeft className="size-6 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                </Link>

                <div
                    className={cn(
                        "z-10 grid w-full grid-cols-7 items-center p-2 md:grid-cols-9 md:p-4"
                    )}>
                    <div
                        className={
                            "col-span-4 flex min-w-[200px] items-center gap-2 overflow-hidden md:gap-3"
                        }>
                        <Avatar
                            className={cn(
                                "hidden size-6 flex-shrink-0 rounded-sm md:block md:size-8",
                                {
                                    "opacity-40 grayscale": !player.completed
                                }
                            )}>
                            <AvatarImage
                                src={bungieProfileIconUrl(emblemDefinition?.secondaryOverlay)}
                                alt={displayName}
                            />
                            <AvatarFallback className="rounded-sm bg-zinc-800">
                                {displayName.charAt(0).toLocaleUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-nowrap items-center gap-1 overflow-x-auto text-sm font-medium md:gap-2 md:text-lg">
                            <div className="ml-1 flex h-8 items-center gap-1">
                                {player.characters
                                    .toSorted((c1, c2) => {
                                        if (!c1.completed !== c2.completed) {
                                            return c1.completed ? -1 : 1
                                        }
                                        if (c1.timePlayedSeconds !== c2.timePlayedSeconds) {
                                            return c2.timePlayedSeconds - c1.timePlayedSeconds
                                        }
                                        return c2.kills - c1.kills
                                    })
                                    .map(character => {
                                        const [CharacterIcon, characterName] = getCharacterIcon(
                                            character.classHash
                                        )
                                        return (
                                            <Tooltip key={character.characterId}>
                                                <TooltipTrigger asChild>
                                                    <CharacterIcon
                                                        className={cn(
                                                            "size-6",
                                                            player.completed
                                                                ? "text-primary"
                                                                : "text-zinc-500"
                                                        )}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom" align="start">
                                                    {characterName}
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    })}
                            </div>
                            <div
                                className={cn("ml-2 truncate", {
                                    "text-zinc-500": !player.completed
                                })}>
                                {displayName}
                            </div>

                            <div className="ml-1 hidden items-center gap-1 md:flex">
                                {mvp === player.playerInfo.membershipId && (
                                    <PlayerBadge variant="mvp" />
                                )}
                                {player.isFirstClear && <PlayerBadge variant="firstClear" />}
                                {!player.completed && <PlayerBadge variant="dnf" />}
                            </div>
                            <ChevronRight
                                className={cn(
                                    "ml-auto h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100 md:h-4 md:w-4",
                                    player.completed ? "text-zinc-500" : "text-zinc-600"
                                )}
                            />
                        </div>
                    </div>
                    <div
                        className={cn("text-primary/85 text-center text-xs md:text-sm lg:text-lg", {
                            "text-zinc-500": !player.completed
                        })}>
                        {stats.kills.toLocaleString()}
                    </div>
                    <div
                        className={cn("text-primary/85 text-center text-xs md:text-sm lg:text-lg", {
                            "text-zinc-500": !player.completed
                        })}>
                        {stats.deaths.toLocaleString()}
                    </div>
                    <div
                        className={cn(
                            "text-primary/85 hidden text-center text-xs md:block md:text-sm lg:text-lg",
                            {
                                "text-zinc-500": !player.completed
                            }
                        )}>
                        {stats.assists.toLocaleString()}
                    </div>
                    <div
                        className={cn(
                            "text-primary/85 hidden text-center text-xs md:block md:text-sm lg:text-lg",
                            {
                                "text-zinc-500": !player.completed
                            }
                        )}>
                        {(stats.kills + stats.deaths === 0
                            ? 0
                            : stats.kills / stats.deaths
                        ).toFixed(2)}
                    </div>
                    <div
                        className={cn("text-primary/85 text-center", {
                            "text-zinc-500": !player.completed
                        })}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center justify-center">
                                    <ActivityPieChart
                                        percentage={activityPercentage}
                                        size={16}
                                        color={player.completed ? "green" : "orange"}
                                        className="hidden md:block"
                                    />
                                    <span
                                        className={cn(
                                            "text-primary/85 ml-2 text-xs md:text-sm lg:text-lg",
                                            {
                                                "text-zinc-500": !player.completed
                                            }
                                        )}>
                                        {secondsToHMS(timePlayed, false)}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                Present for {activityPercentage}% of the activity
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </TooltipProvider>
        </Button>
    )
}
