"use client"

import { usePGCRContext } from "~/hooks/pgcr/ClientStateManager"
import { cn } from "~/lib/tw"
import { type RaidHubInstancePlayerExtended } from "~/services/raidhub/types"
import { Avatar, AvatarFallback, AvatarImage } from "~/shad/avatar"
import { bungieProfileIconUrl, getBungieDisplayName } from "~/util/destiny"

export interface ColumnLeaderEntry {
    player: RaidHubInstancePlayerExtended
    value: string
    shareLabel?: string
    caption?: string
    accent?: "deaths"
}

export interface TeamSummaryColumn {
    label: string
    teamValue: string
    leaders: ColumnLeaderEntry[]
}

interface PGCRTeamSummaryProps {
    mvp?: RaidHubInstancePlayerExtended
    columns: TeamSummaryColumn[]
}

export function PGCRTeamSummary({ mvp, columns }: PGCRTeamSummaryProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
            <div className="overflow-x-auto">
                <div
                    className="grid min-w-max divide-x divide-zinc-800"
                    style={{
                        gridTemplateColumns: `repeat(${columns.length}, minmax(7.5rem, 1fr))`
                    }}>
                    {columns.map(column => (
                        <SummaryColumn key={column.label} {...column} />
                    ))}
                </div>
            </div>

            {mvp && <MvpBanner player={mvp} />}
        </div>
    )
}

const MvpBanner = ({ player }: { player: RaidHubInstancePlayerExtended }) => {
    const { query } = usePGCRContext()
    const displayName = getBungieDisplayName(player.playerInfo, { excludeCode: true })

    return (
        <button
            type="button"
            onClick={() => query.set("player", player.playerInfo.membershipId)}
            className="group flex w-full items-center gap-2 border-t border-zinc-800 bg-yellow-500/[0.04] px-3 py-2 text-left transition-colors hover:bg-yellow-500/[0.07] md:gap-3 md:px-4 md:py-2.5">
            <Avatar className="size-7 flex-shrink-0 rounded-sm md:size-8">
                <AvatarImage
                    src={bungieProfileIconUrl(player.playerInfo.iconPath)}
                    alt={displayName}
                />
                <AvatarFallback className="rounded-sm bg-zinc-800 text-xs">
                    {displayName.charAt(0).toLocaleUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
                <div className="text-[10px] font-medium tracking-wider text-yellow-500/80 uppercase">
                    MVP
                </div>
                <div className="truncate text-sm font-medium group-hover:text-white">
                    {displayName}
                </div>
            </div>
        </button>
    )
}

const SummaryColumn = ({ label, teamValue, leaders }: TeamSummaryColumn) => (
    <div className="flex min-w-[7.5rem] flex-col">
        <div className="border-b border-zinc-800 px-3 py-3 text-center md:px-4 md:py-4">
            <div className="text-primary/90 text-xl font-semibold tabular-nums md:text-2xl">
                {teamValue}
            </div>
            <div className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                {label}
            </div>
        </div>
        <div className="flex flex-1 flex-col">
            {leaders.map((leader, index) => (
                <ColumnLeader
                    key={`${leader.player.playerInfo.membershipId}-${leader.caption ?? index}`}
                    {...leader}
                    bordered={index > 0}
                />
            ))}
        </div>
    </div>
)

const ColumnLeader = ({
    player,
    value,
    shareLabel,
    caption,
    accent,
    bordered
}: ColumnLeaderEntry & { bordered?: boolean }) => {
    const { query } = usePGCRContext()
    const displayName = getBungieDisplayName(player.playerInfo, { excludeCode: true })

    return (
        <button
            type="button"
            onClick={() => query.set("player", player.playerInfo.membershipId)}
            className={cn(
                "group flex flex-1 flex-col items-center gap-1.5 px-2 py-2.5 text-center transition-colors hover:bg-zinc-900/80 md:gap-2 md:px-3 md:py-3",
                bordered && "border-t border-zinc-800",
                accent === "deaths" && "bg-zinc-900/40"
            )}>
            <Avatar className="size-6 flex-shrink-0 rounded-sm md:size-7">
                <AvatarImage
                    src={bungieProfileIconUrl(player.playerInfo.iconPath)}
                    alt={displayName}
                />
                <AvatarFallback className="rounded-sm bg-zinc-800 text-[10px]">
                    {displayName.charAt(0).toLocaleUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="w-full min-w-0">
                <div className="truncate text-xs font-medium group-hover:text-white">
                    {displayName}
                </div>
                {caption && (
                    <div className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                        {caption}
                    </div>
                )}
                <div
                    className={cn(
                        "mt-0.5 text-lg font-semibold tabular-nums md:text-xl",
                        accent === "deaths" ? "text-zinc-400" : "text-primary/90"
                    )}>
                    {value}
                </div>
                {shareLabel && (
                    <div className="text-[10px] text-zinc-500 tabular-nums">{shareLabel}</div>
                )}
            </div>
        </button>
    )
}
