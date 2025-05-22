import { type Collection } from "@discordjs/collection"
import { Sword, Trophy } from "lucide-react"
import { Fragment } from "react"
import PlayerRow from "~/components/pgcr/player-row"
import { type PlayerStats } from "~/lib/pgcr/types"
import { type RaidHubInstanceExtended } from "~/services/raidhub/types"
import { Card, CardContent, CardHeader } from "~/shad/card"
import { ScrollArea } from "~/shad/scroll-area"
import { Separator } from "~/shad/separator"
import { getBungieDisplayName } from "~/util/destiny"
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
    const mostAssists = playerMergedStats.sort((a, b) => b.assists - a.assists).firstKey()!
    const mostAssistsPlayer = data.players.find(p => p.playerInfo.membershipId === mostAssists)!
    const mostDeaths = playerMergedStats.sort((a, b) => b.deaths - a.deaths).firstKey()!
    const mostDeathsPlayer = data.players.find(p => p.playerInfo.membershipId === mostDeaths)!
    const bestKD = playerMergedStats
        .sort((a, b) => b.kills / (b.deaths || 1) - a.kills / (a.deaths || 1))
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
        <CardContent className="space-y-6 bg-black p-2 md:p-6">
            {/* Players Section */}

            <div className="gap-1 rounded-lg border-none py-0 md:rounded-none">
                <div className="grid w-full grid-cols-7 justify-center p-2 text-xs font-medium text-zinc-500 uppercase md:grid-cols-9">
                    <h3 className="col-span-4 min-w-[200px] text-sm">Summary</h3>
                    <div className="text-center">Kills</div>
                    <div className="text-center">Deaths</div>
                    <div className="hidden text-center md:block">Assists</div>
                    <div className="hidden text-center md:block">K/D</div>
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

            {/* Activity Summary Section */}

            {data.playerCount > 1 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card className="rounded-none border-zinc-800 bg-zinc-950">
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
                                        value={getBungieDisplayName(mvpPlayer.playerInfo, {
                                            excludeCode: true
                                        })}
                                    />
                                    <Separator className="bg-zinc-800" />
                                </>
                            )}
                            <LabeledStat
                                label="Most Kills"
                                value={`${getBungieDisplayName(mostKillsPlayer.playerInfo, {
                                    excludeCode: true
                                })} - ${playerMergedStats.get(mostKills)!.kills.toLocaleString()}`}
                            />
                            <Separator className="bg-zinc-800" />
                            <LabeledStat
                                label="Most Assists"
                                value={`${getBungieDisplayName(mostAssistsPlayer.playerInfo, {
                                    excludeCode: true
                                })} - ${playerMergedStats.get(mostAssists)!.assists.toLocaleString()}`}
                            />
                            <Separator className="bg-zinc-800" />
                            <LabeledStat
                                label="Best K/D"
                                value={`${getBungieDisplayName(bestKDPlayer.playerInfo, {
                                    excludeCode: true
                                })} - ${(
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

                    <Card className="rounded-none border-zinc-800 bg-zinc-950">
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
                            <LabeledStat label="Team K/D" value={totalKd.toFixed(2)} />
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
    )
}

const LabeledStat = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="text-sm font-medium">{value}</span>
    </div>
)
