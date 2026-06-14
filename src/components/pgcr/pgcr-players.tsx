import { type Collection } from "@discordjs/collection"
import { Fragment } from "react"
import { PGCRTeamSummary } from "~/components/pgcr/pgcr-team-summary"
import PlayerRow from "~/components/pgcr/player-row"
import {
    formatKdRelativeToAveragePercentage,
    formatTeamSharePercentage
} from "~/lib/pgcr/formatting"
import { type PlayerStats } from "~/lib/pgcr/types"
import { type RaidHubInstanceExtended } from "~/services/raidhub/types"
import { CardContent } from "~/shad/card"
import { ScrollArea } from "~/shad/scroll-area"
import { Separator } from "~/shad/separator"
import { AllPgcrWeaponsWrapper } from "./pgcr-weapons"

interface PGCRPlayersProps {
    data: RaidHubInstanceExtended
    mvp: string | null
    playerMergedStats: Collection<string, PlayerStats>
    sortScores: Collection<
        string,
        {
            completed: boolean
            score: number
        }
    >
}

export const PGCRPlayers = ({ data, mvp, playerMergedStats, sortScores }: PGCRPlayersProps) => {
    const mvpPlayer = mvp ? data.players.find(p => p.playerInfo.membershipId === mvp)! : null
    const mostKills = playerMergedStats.sort((a, b) => b.kills - a.kills).firstKey()!
    const mostKillsPlayer = data.players.find(p => p.playerInfo.membershipId === mostKills)!
    const mostDeaths = playerMergedStats.sort((a, b) => b.deaths - a.deaths).firstKey()!
    const mostDeathsPlayer = data.players.find(p => p.playerInfo.membershipId === mostDeaths)!
    const mostAssists = playerMergedStats.sort((a, b) => b.assists - a.assists).firstKey()!
    const mostAssistsPlayer = data.players.find(p => p.playerInfo.membershipId === mostAssists)!
    const bestKD = playerMergedStats
        .sort((a, b) => b.kills / (b.deaths || 1) - a.kills / (a.deaths || 1))
        .firstKey()!
    const bestKDPlayer = data.players.find(p => p.playerInfo.membershipId === bestKD)!
    const mostMelee = playerMergedStats.sort((a, b) => b.meleeKills - a.meleeKills).firstKey()!
    const mostMeleePlayer = data.players.find(p => p.playerInfo.membershipId === mostMelee)!
    const mostGrenades = playerMergedStats
        .sort((a, b) => b.grenadeKills - a.grenadeKills)
        .firstKey()!
    const mostGrenadesPlayer = data.players.find(p => p.playerInfo.membershipId === mostGrenades)!
    const mostSuperKills = playerMergedStats.sort((a, b) => b.superKills - a.superKills).firstKey()!
    const mostSuperKillsPlayer = data.players.find(
        p => p.playerInfo.membershipId === mostSuperKills
    )!

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

    const totalKd = totals.kills / (totals.deaths || 1)

    const _bestKdPlayerStats = playerMergedStats.get(bestKD)!
    const bestKd = _bestKdPlayerStats.kills / (_bestKdPlayerStats.deaths || 1)

    const mostKillsValue = playerMergedStats.get(mostKills)!.kills
    const mostDeathsValue = playerMergedStats.get(mostDeaths)!.deaths
    const mostAssistsValue = playerMergedStats.get(mostAssists)!.assists
    const mostMeleeValue = playerMergedStats.get(mostMelee)!.meleeKills
    const mostGrenadesValue = playerMergedStats.get(mostGrenades)!.grenadeKills
    const mostSuperKillsValue = playerMergedStats.get(mostSuperKills)!.superKills

    const teamSummaryColumns = [
        {
            label: "Kills",
            teamValue: totals.kills.toLocaleString(),
            leaders: [
                {
                    player: mostKillsPlayer,
                    value: mostKillsValue.toLocaleString(),
                    shareLabel: formatTeamSharePercentage(mostKillsValue, totals.kills) ?? undefined
                }
            ]
        },
        {
            label: "Deaths",
            teamValue: totals.deaths.toLocaleString(),
            leaders: [
                {
                    player: mostDeathsPlayer,
                    value: mostDeathsValue.toLocaleString(),
                    shareLabel:
                        formatTeamSharePercentage(mostDeathsValue, totals.deaths) ?? undefined,
                    accent: totals.deaths > 0 ? ("deaths" as const) : undefined
                }
            ]
        },
        {
            label: "Assists",
            teamValue: totals.assists.toLocaleString(),
            leaders: [
                {
                    player: mostAssistsPlayer,
                    value: mostAssistsValue.toLocaleString(),
                    shareLabel:
                        formatTeamSharePercentage(mostAssistsValue, totals.assists) ?? undefined
                }
            ]
        },
        {
            label: "K/D",
            teamValue: totalKd.toFixed(2),
            leaders: [
                {
                    player: bestKDPlayer,
                    value: bestKd.toFixed(2),
                    shareLabel: formatKdRelativeToAveragePercentage(bestKd, totalKd) ?? undefined
                }
            ]
        },
        {
            label: "Melee Kills",
            teamValue: totals.meleeKills.toLocaleString(),
            leaders: [
                {
                    player: mostMeleePlayer,
                    value: mostMeleeValue.toLocaleString(),
                    shareLabel:
                        formatTeamSharePercentage(mostMeleeValue, totals.meleeKills) ?? undefined
                }
            ]
        },
        {
            label: "Grenade Kills",
            teamValue: totals.grenadeKills.toLocaleString(),
            leaders: [
                {
                    player: mostGrenadesPlayer,
                    value: mostGrenadesValue.toLocaleString(),
                    shareLabel:
                        formatTeamSharePercentage(mostGrenadesValue, totals.grenadeKills) ??
                        undefined
                }
            ]
        },
        {
            label: "Super Kills",
            teamValue: totals.superKills.toLocaleString(),
            leaders: [
                {
                    player: mostSuperKillsPlayer,
                    value: mostSuperKillsValue.toLocaleString(),
                    shareLabel:
                        formatTeamSharePercentage(mostSuperKillsValue, totals.superKills) ??
                        undefined
                }
            ]
        }
    ]

    return (
        <CardContent className="space-y-6 bg-black p-2 md:p-6">
            {/* Players Section */}

            <div className="gap-1 rounded-lg border-none py-0 md:rounded-none">
                <div className="grid w-full grid-cols-7 justify-center p-2 text-xs font-medium text-zinc-500 uppercase md:grid-cols-9">
                    <h3 className="col-span-4 min-w-[200px] text-sm">Summary</h3>
                    <div className="text-center">Kills</div>
                    <div className="text-center">Deaths</div>
                    <div className="hidden text-center md:block">Assists</div>
                    <div className="hidden text-center md:block">Kill Share</div>
                    <div className="text-center">Time</div>
                </div>

                <ScrollArea className="bg-background max-h-[600px] w-full overflow-x-auto border-x-1 border-b-1 border-zinc-800">
                    {sortScores.map((_, id) => (
                        <Fragment key={id}>
                            <Separator className="bg-zinc-800" />
                            <PlayerRow
                                player={data.players.find(p => p.playerInfo.membershipId === id)!}
                            />
                        </Fragment>
                    ))}
                </ScrollArea>
            </div>

            {data.playerCount > 1 && (
                <PGCRTeamSummary mvp={mvpPlayer ?? undefined} columns={teamSummaryColumns} />
            )}

            <AllPgcrWeaponsWrapper {...totals} />
        </CardContent>
    )
}
