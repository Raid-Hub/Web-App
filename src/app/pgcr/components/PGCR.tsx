import { Collection } from "@discordjs/collection"
import { CheckCircle, Clock, Flag, Sword, Trophy, Users, XCircle } from "lucide-react"
import { Fragment } from "react"
import PlayerRow from "~/app/pgcr/components/player-row"
import { R2RaidSplash, getRaidSplash } from "~/data/activity-images"
import { cn } from "~/lib/tw"
import { type RaidHubInstanceExtended } from "~/services/raidhub/types"
import { Badge } from "~/shad/badge"
import { Card, CardContent, CardHeader } from "~/shad/card"
import { ScrollArea } from "~/shad/scroll-area"
import { Separator } from "~/shad/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/shad/tooltip"
import { getBungieDisplayName } from "~/util/destiny"
import { secondsToHMS } from "~/util/presentation/formatting"
import { ClientStateManager } from "./ClientStateManager"
import { PGCRDate, TimeRangeTooltip } from "./pgcr-date"
import { PGCRTags } from "./pgcr-tags"
import { AllPgcrWeaponsWrapper } from "./pgcr-weapons"
import { PlayerDetailsPanelWrapper } from "./player-details-panel"
import { generateSortScore } from "./riis"

interface PGCRProps {
    data: RaidHubInstanceExtended
}

export default function PGCR({ data }: PGCRProps) {
    const sortScores = new Collection(
        data.players.map(p => [
            p.playerInfo.membershipId,
            {
                completed: p.completed,
                score: generateSortScore(p)
            }
        ])
    ).toSorted((a, b) => {
        if (a.completed === b.completed) {
            return b.score - a.score
        } else {
            return a.completed ? -1 : 1
        }
    })

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
    const mostAssists = playerMergedStats.sort((a, b) => b.assists - a.assists).firstKey()!
    const mostAssistsPlayer = data.players.find(p => p.playerInfo.membershipId === mostAssists)!
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

    const totalKd = totals.kills / totals.deaths

    return (
        <ClientStateManager
            data={data}
            mvp={mvp}
            scores={Array.from(sortScores.entries())}
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
                                            <div
                                                className={cn(
                                                    "rounded-full p-1",
                                                    data.completed
                                                        ? "bg-green-500/30 text-green-400"
                                                        : "bg-red-500/30 text-red-400"
                                                )}>
                                                {data.completed ? (
                                                    <CheckCircle className="h-7 w-7 p-1" />
                                                ) : (
                                                    <XCircle className="h-7 w-7 p-1" />
                                                )}
                                            </div>
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
                                                        "rounded-full p-1",
                                                        data.fresh === null
                                                            ? "bg-amber-500/30 text-amber-400"
                                                            : "bg-orange-500/30 text-orange-400"
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
                                <div className="mt-4 flex items-center justify-center gap-4">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2 text-zinc-300">
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
                                    {(data.playerCount > 3 || !data.completed) && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge
                                                    variant="outline"
                                                    className="bg-background/70 flex items-center gap-1 border-zinc-700 whitespace-nowrap">
                                                    <Users className="h-3 w-3" />
                                                    <span>{data.playerCount} Players</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                {`${data.players.reduce(
                                                    (acc, player) => +player.completed + acc,
                                                    0
                                                )} of ${
                                                    data.playerCount
                                                } players completed the activity`}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </CardHeader>
                        </div>

                        <Separator className="bg-zinc-800" />

                        <CardContent className="space-y-6 bg-black p-2 md:p-6">
                            {/* Players Section */}

                            <Card className="gap-1 rounded-lg border-zinc-800 bg-zinc-950 py-0 md:rounded-xl">
                                <CardHeader className="gap-0 p-2 pb-0">
                                    <div className="grid w-full grid-cols-7 justify-center text-xs font-medium text-zinc-500 uppercase md:grid-cols-9">
                                        <h3 className="col-span-4 min-w-[200px] text-sm">
                                            Summary
                                        </h3>
                                        <div className="text-center">Kills</div>
                                        <div className="text-center">Deaths</div>
                                        <div className="hidden text-center md:block">Assists</div>
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
                                                            p => p.playerInfo.membershipId === id
                                                        )!
                                                    }
                                                />
                                            </Fragment>
                                        ))}
                                    </ScrollArea>
                                </CardContent>
                            </Card>

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
                                                    mostAssistsPlayer.playerInfo,
                                                    {
                                                        excludeCode: true
                                                    }
                                                )} - ${playerMergedStats.get(mostAssists)!.assists.toLocaleString()}`}
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
                                            <Separator className="bg-zinc-800" />
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <LabeledStat
                                                        label="MGR"
                                                        value={(
                                                            100 * totals.grenadeKills +
                                                            totals.meleeKills
                                                        ).toFixed(2)}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" align="start">
                                                    Percentage of kills from Grenade and Melee
                                                    abilities
                                                </TooltipContent>
                                            </Tooltip>
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
