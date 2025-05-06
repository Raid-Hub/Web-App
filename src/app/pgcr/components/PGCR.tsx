import { Collection } from "@discordjs/collection"
import { CheckCircle, Clock, Flag, Sword, Trophy, Users, XCircle } from "lucide-react"
import { Fragment } from "react"
import PlayerRow from "~/app/pgcr/components/player-row"
import { R2RaidSplash, getRaidSplash } from "~/data/activity-images"
import { cn } from "~/lib/tw"
import {
    type RaidHubInstanceExtended,
    type RaidHubInstancePlayerExtended
} from "~/services/raidhub/types"
import { Badge } from "~/shad/badge"
import { Card, CardContent, CardHeader } from "~/shad/card"
import { ScrollArea } from "~/shad/scroll-area"
import { Separator } from "~/shad/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/shad/tooltip"
import { getBungieDisplayName } from "~/util/destiny"
import { round } from "~/util/math"
import { secondsToHMS } from "~/util/presentation/formatting"
import { ClientStateManager } from "./ClientStateManager"
import { PGCRDate, TimeRangeTooltip } from "./pgcr-date"
import { PGCRTags } from "./pgcr-tags"
import { AllPgcrWeaponsWrapper } from "./pgcr-weapons"
import { PlayerDetailsPanelWrapper } from "./player-details-panel/player-details-panel-wrapper"

interface PGCRProps {
    data: RaidHubInstanceExtended
}

export default function PGCR({ data }: PGCRProps) {
    const sortScores = new Collection(
        data.players.map(p => [p.playerInfo.membershipId, generateSortScore(p)])
    ).toSorted((a, b) => b - a)

    const playerMergedStats = new Collection(
        data.players.map(
            player =>
                [
                    player.playerInfo.membershipId,
                    player.characters.reduce(
                        (acc, character) => ({
                            kills: acc.kills + character.kills,
                            deaths: acc.deaths + character.deaths,
                            assists: acc.assists + character.assists,
                            precisionKills: acc.precisionKills + character.precisionKills,
                            superKills: acc.superKills + character.superKills,
                            meleeKills: acc.meleeKills + character.meleeKills,
                            grenadeKills: acc.grenadeKills + character.grenadeKills,
                            timePlayedSeconds: acc.timePlayedSeconds + character.timePlayedSeconds
                        }),
                        {
                            kills: 0,
                            deaths: 0,
                            assists: 0,
                            precisionKills: 0,
                            superKills: 0,
                            meleeKills: 0,
                            grenadeKills: 0,
                            timePlayedSeconds: 0
                        }
                    )
                ] as const
        )
    )

    const mvp = data.completed && data.playerCount > 2 ? sortScores.firstKey()! : null

    const backgroundImage = getRaidSplash(data.activityId)!
    const backgroundImageUrl = [
        "https://cdn.raidhub.io/content",
        R2RaidSplash[backgroundImage].path,
        R2RaidSplash[backgroundImage].variants.small
    ].join("/")

    const mvpPlayer = mvp ? data.players.find(p => p.playerInfo.membershipId === mvp)! : null
    const mostKills = playerMergedStats.sort((a, b) => b.kills - a.kills).firstKey()!
    const mostKillsPlayer = data.players.find(p => p.playerInfo.membershipId === mostKills)!
    const mostDeaths = playerMergedStats.sort((a, b) => b.deaths - a.deaths).firstKey()!
    const mostDeathsPlayer = data.players.find(p => p.playerInfo.membershipId === mostDeaths)!
    const bestKD = playerMergedStats
        .sort((a, b) => b.kills / b.deaths - a.kills / (a.deaths || 1))
        .firstKey()!
    const bestKDPlayer = data.players.find(p => p.playerInfo.membershipId === bestKD)!

    const totals = playerMergedStats.reduce(
        (acc, stats) => ({
            kills: acc.kills + stats.kills,
            deaths: acc.deaths + stats.deaths,
            assists: acc.assists + stats.assists,
            precisionKills: acc.precisionKills + stats.precisionKills,
            superKills: acc.superKills + stats.superKills,
            meleeKills: acc.meleeKills + stats.meleeKills,
            grenadeKills: acc.grenadeKills + stats.grenadeKills,
            timePlayedSeconds: acc.timePlayedSeconds + stats.timePlayedSeconds
        }),
        {
            kills: 0,
            deaths: 0,
            assists: 0,
            precisionKills: 0,
            superKills: 0,
            meleeKills: 0,
            grenadeKills: 0,
            timePlayedSeconds: 0
        }
    )

    const totalKd = (totals.kills / totals.deaths)

    return (
        <ClientStateManager
            data={data}
            mvp={mvp}
            playerStatsMerged={Array.from(playerMergedStats.entries())}>
            <TooltipProvider>
                <div className="container mx-auto my-auto w-full max-w-5xl">
                    <Card className="w-full gap-0 overflow-hidden border border-zinc-800 bg-zinc-950 py-0 shadow-md md:w-[768px] lg:w-[956px] xl:w-[1096px]">
                        {/* Header with background splash */}
                        <div
                            className="relative min-h-40 overflow-hidden rounded-t-lg md:h-48"
                            style={{
                                backgroundImage: `url(${backgroundImageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                            }}>
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 backdrop-blur-[2px]" />
                            <CardHeader className="absolute inset-0 flex flex-col gap-2 p-2 md:p-6">
                                <PGCRDate />
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight text-white md:text-4xl">
                                        {data.metadata.isRaid
                                            ? data.metadata.activityName
                                            : `${data.metadata.activityName}: ${data.metadata.versionName}`}
                                    </h1>

                                    {/* Cleared status badge */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            {data.completed ? (
                                                <div className="rounded-full bg-green-500/20 p-1 text-green-400">
                                                    <CheckCircle className="h-7 w-7 p-1" />
                                                </div>
                                            ) : (
                                                <div className="rounded-full bg-red-500/20 p-1 text-red-400">
                                                    <XCircle className="h-7 w-7 p-1" />
                                                </div>
                                            )}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {data.completed
                                                ? "Activity Cleared"
                                                : "Activity Not Cleared"}
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Checkpoint flag */}
                                    {!data.fresh && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "rounded-full",
                                                        data.fresh === null
                                                            ? "bg-amber-500/20 text-amber-400"
                                                            : "bg-red-500/20 p-1 text-red-400"
                                                    )}>
                                                    <Flag className="h-7 w-7 p-1" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {data.fresh === null
                                                    ? "This activity may or may not be a checkpoint"
                                                    : "This activity was started from a checkpoint"}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Difficulty badge */}
                                    {data.metadata.isRaid && (
                                        <Badge
                                            variant="secondary"
                                            className="bg-primary/90 text-primary-foreground text-sm">
                                            {data.isContest ? "Contest" : data.metadata.versionName}
                                        </Badge>
                                    )}

                                    {/* Tags */}
                                    <PGCRTags />
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="mt-4 flex items-center gap-2 text-zinc-300">
                                            <Clock className="h-3 w-3 md:h-4 md:w-4" />
                                            <span className="text-xs md:text-sm">
                                                {secondsToHMS(data.duration, false)}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TimeRangeTooltip
                                        startDate={new Date(data.dateStarted)}
                                        endDate={new Date(data.dateCompleted)}
                                    />
                                </Tooltip>
                            </CardHeader>
                        </div>

                        <Separator className="bg-zinc-800" />

                        <CardContent className="space-y-6 bg-black p-2 md:p-6">
                            {/* Players Section */}
                            <div className="space-y-2">
                                <div className="hidden items-center justify-between md:flex">
                                    <h3>Summary</h3>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge
                                                variant="outline"
                                                className="flex items-center gap-1 border-zinc-700 whitespace-nowrap">
                                                <Users className="h-3 w-3" />
                                                <span>{data.playerCount} Players</span>
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {`${data.players.reduce(
                                                (acc, player) => +player.completed + acc,
                                                0
                                            )} of ${
                                                data.playerCount
                                            } players completed the activity`}
                                        </TooltipContent>
                                    </Tooltip>
                                </div>

                                <Card className="gap-1 border-zinc-800 bg-zinc-950 py-0">
                                    <CardHeader className="gap-0 p-2 pb-1 md:px-4">
                                        <div className="grid w-full grid-cols-7 text-xs font-medium text-zinc-500 uppercase md:grid-cols-9">
                                            <div className="col-span-4 min-w-[200px]">Player</div>
                                            <div className="text-center">Kills</div>
                                            <div className="text-center">Deaths</div>
                                            <div className="hidden text-center md:block">
                                                Assists
                                            </div>
                                            <div className="hidden text-center md:block">K/D</div>
                                            <div className="text-center">Time</div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ScrollArea className="max-h-[600px] w-full overflow-x-auto">
                                            {sortScores.map((_, id) => (
                                                <Fragment key={id}>
                                                    <Separator className="bg-zinc-800" />
                                                    <PlayerRow
                                                        player={
                                                            data.players.find(
                                                                p =>
                                                                    p.playerInfo.membershipId === id
                                                            )!
                                                        }
                                                    />
                                                </Fragment>
                                            ))}
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Activity Summary Section */}

                            {data.playerCount > 1 && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Card className="border-zinc-800 bg-zinc-950">
                                        <CardHeader>
                                            <h3 className="flex items-center gap-2 text-base font-medium md:text-lg">
                                                <Trophy className="text-raidhub h-4 w-4 md:h-5 md:w-5" />
                                                Activity Highlights
                                            </h3>
                                        </CardHeader>
                                        <CardContent className="space-y-3 p-4 pt-0">
                                            {mvpPlayer && (
                                                <>
                                                    <LabeledStat
                                                        label="MVP"
                                                        value={getBungieDisplayName(
                                                            mvpPlayer.playerInfo,
                                                            {
                                                                excludeCode: true
                                                            }
                                                        )}
                                                    />
                                                    <Separator className="bg-zinc-800" />
                                                </>
                                            )}
                                            <LabeledStat
                                                label="Most Kills"
                                                value={`${getBungieDisplayName(
                                                    mostKillsPlayer.playerInfo,
                                                    {
                                                        excludeCode: true
                                                    }
                                                )} - ${playerMergedStats.get(mostKills)!.kills.toLocaleString()}`}
                                            />
                                            <Separator className="bg-zinc-800" />
                                            <LabeledStat
                                                label="Most Assists"
                                                value={`${getBungieDisplayName(
                                                    mostKillsPlayer.playerInfo,
                                                    {
                                                        excludeCode: true
                                                    }
                                                )} - ${playerMergedStats.get(mostKills)!.assists.toLocaleString()}`}
                                            />
                                            <Separator className="bg-zinc-800" />
                                            <LabeledStat
                                                label="Best K/D"
                                                value={`${getBungieDisplayName(
                                                    bestKDPlayer.playerInfo,
                                                    {
                                                        excludeCode: true
                                                    }
                                                )} - ${(
                                                    playerMergedStats.get(bestKD)!.kills /
                                                    playerMergedStats.get(bestKD)!.deaths
                                                ).toFixed(2)}`}
                                            />
                                            {totals.deaths > 0 && (
                                                <>
                                                    <Separator className="bg-zinc-800" />
                                                    <LabeledStat
                                                        label="Most Deaths"
                                                        value={`${getBungieDisplayName(
                                                            mostDeathsPlayer.playerInfo,
                                                            {
                                                                excludeCode: true
                                                            }
                                                        )} - ${playerMergedStats.get(mostDeaths)!.deaths.toLocaleString()}`}
                                                    />
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="border-zinc-800 bg-zinc-950">
                                        <CardHeader>
                                            <h3 className="flex items-center gap-2 text-base font-medium md:text-lg">
                                                <Sword className="text-raidhub h-4 w-4 md:h-5 md:w-5" />
                                                Combat Stats
                                            </h3>
                                        </CardHeader>
                                        <CardContent className="space-y-3 p-4 pt-0">
                                            <LabeledStat
                                                label="Total Kills"
                                                value={totals.kills.toLocaleString()}
                                            />
                                            <Separator className="bg-zinc-800" />
                                            <LabeledStat
                                                label="Total Assists"
                                                value={totals.assists.toLocaleString()}
                                            />
                                            <Separator className="bg-zinc-800" />
                                            <LabeledStat
                                                label="Total Deaths"
                                                value={totals.deaths.toLocaleString()}
                                            />
                                            <Separator className="bg-zinc-800" />
                                            <LabeledStat
                                                label="Team K/D"
                                                value={totalKd.toFixed(2)}
                                            />
                                            <Separator className="bg-zinc-800" />
                                            <LabeledStat
                                                label="Total Super Kills"
                                                value={totals.superKills.toLocaleString()}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            <AllPgcrWeaponsWrapper {...totals} />
                        </CardContent>
                    </Card>

                    {/*  Player Details Panel */}
                    <PlayerDetailsPanelWrapper />
                </div>
            </TooltipProvider>
        </ClientStateManager>
    )
}

const LabeledStat = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="text-sm font-medium">{value}</span>
    </div>
)

function generateSortScore(d: RaidHubInstancePlayerExtended) {
    const stats = d.characters.reduce(
        (acc, c) => ({
            kills: acc.kills + c.kills,
            deaths: acc.deaths + c.deaths,
            assists: acc.assists + c.assists,
            precisionKills: acc.precisionKills + c.precisionKills,
            superKills: acc.superKills + c.superKills,
            score: acc.score + c.score
        }),
        {
            kills: 0,
            deaths: 0,
            assists: 0,
            precisionKills: 0,
            superKills: 0,
            score: 0
        }
    )

    const adjustedTimePlayedSeconds = Math.min(d.timePlayedSeconds || 1, 32767)
    // kills weighted 2x assists, slight diminishing returns
    const killScore =
        (100 * (stats.kills + 0.5 * stats.assists) ** 0.95) /
            (round(adjustedTimePlayedSeconds, -1) || 1) +
        stats.kills / 400

    // a multiplier based on your time per deaths squared, normalized a bit by using deaths + 7
    const deathScore = ((1 / 6) * adjustedTimePlayedSeconds) / (stats.deaths + 7) ** 0.95

    const timeScore = 50 * (adjustedTimePlayedSeconds / 3600) // 50 points per hour

    const precisionScore = (stats.precisionKills / (stats.kills || 1)) * 10 // 1 point per 10% of kills

    const superScore = (stats.superKills / (adjustedTimePlayedSeconds / 60)) * 5 // 1 point per super kill per minute

    const completionScore = d.completed ? 1 : 0.5

    const raidhubScore =
        (killScore * deathScore + timeScore + precisionScore + superScore) * completionScore

    return raidhubScore * Math.max(stats.score, 1)
}
