"use client"

import { ChevronRight } from "lucide-react"
import { ActivityPieChart } from "~/app/pgcr/components/activity-pie-chart"
import { Button } from "~/components/ui/button"
import { useItemDefinition } from "~/hooks/dexie"
import { cn } from "~/lib/tw"
import { type RaidHubInstancePlayerExtended } from "~/services/raidhub/types"
import { Avatar, AvatarFallback, AvatarImage } from "~/shad/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/shad/tooltip"
import { bungieProfileIconUrl, getBungieDisplayName } from "~/util/destiny"
import { round } from "~/util/math"
import { secondsToHMS } from "~/util/presentation/formatting"
import { useGetCharacterClass } from "../hooks/useCharacterClass"
import { usePGCRQueryParams } from "../hooks/usePGCRQueryParams"
import { usePGCRContext } from "./ClientStateManager"
import { PlayerBadge } from "./player-badge"

interface PlayerRowProps {
    player: RaidHubInstancePlayerExtended
    isSelected?: boolean
}

export default function PlayerRow({ player, isSelected }: PlayerRowProps) {
    const { set } = usePGCRQueryParams()
    const { data, playerStatsMerged } = usePGCRContext()

    const stats = playerStatsMerged.get(player.playerInfo.membershipId)!
    const timePlayed = Math.min(stats.timePlayedSeconds, data.duration)
    const activityPercentage = round(100 * (timePlayed / data.duration), 0)

    const displayName = getBungieDisplayName(player.playerInfo, { excludeCode: true })

    const emblemDefinition = useItemDefinition(player.characters[0].emblemHash ?? 0)

    const getCharacterIcon = useGetCharacterClass()

    return (
        <Button
            variant="ghost"
            className="group h-auto w-full cursor-pointer rounded-none p-0 hover:bg-zinc-900"
            onClick={() => set("player", player.playerInfo.membershipId)}>
            <TooltipProvider>
                <div
                    className={cn(
                        "grid w-full min-w-max grid-cols-10 items-center px-2 py-2 md:grid-cols-8 md:px-4 md:py-3",
                        { "bg-zinc-900": isSelected }
                    )}>
                    <div className="col-span-5 flex min-w-[200px] items-center gap-2 overflow-hidden md:col-span-3 md:gap-3">
                        <Avatar
                            className={cn("h-6 w-6 flex-shrink-0 rounded-sm md:h-8 md:w-8", {
                                "opacity-50": !player.completed
                            })}>
                            <AvatarImage
                                src={bungieProfileIconUrl(emblemDefinition?.displayProperties.icon)}
                                alt={displayName}
                            />
                            <AvatarFallback className="rounded-sm bg-zinc-800">
                                {displayName.charAt(0).toLocaleUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-nowrap items-center gap-1 overflow-x-auto text-sm font-medium md:gap-2 md:text-lg">
                            <span
                                className={cn("truncate", {
                                    "text-zinc-500": !player.completed
                                })}>
                                {displayName}
                            </span>
                            <div className="ml-2 flex h-8 items-center gap-1">
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
                            <div className="ml-1 flex items-center gap-1">
                                {player.sherpas > 0 && <PlayerBadge variant="sherpa" />}
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
                        className={cn("text-center text-xs md:text-lg", {
                            "text-zinc-500": !player.completed
                        })}>
                        {stats.kills.toLocaleString()}
                    </div>
                    <div
                        className={cn("text-center text-xs md:text-lg", {
                            "text-zinc-500": !player.completed
                        })}>
                        {stats.deaths.toLocaleString()}
                    </div>
                    <div
                        className={cn("hidden text-center text-xs md:block md:text-lg", {
                            "text-zinc-500": !player.completed
                        })}>
                        {stats.assists.toLocaleString()}
                    </div>
                    <div
                        className={cn("hidden text-center text-xs md:block md:text-lg", {
                            "text-zinc-500": !player.completed
                        })}>
                        {(stats.kills / stats.deaths).toFixed(2)}
                    </div>
                    <div
                        className={cn("text-center", {
                            "text-zinc-500": !player.completed
                        })}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center justify-center">
                                    <ActivityPieChart
                                        percentage={activityPercentage}
                                        size={16}
                                        color={player.completed ? "green" : "orange"}
                                    />
                                    <span className="ml-2 text-xs md:text-lg">
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
