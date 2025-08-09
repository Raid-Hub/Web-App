import { Collection } from "@discordjs/collection"
import { useMemo } from "react"
import type {
    CombinedCharacterStats,
    CombinedData,
    CombinedPlayerStats,
    CombinedWeaponData
} from "~/lib/multi/multi-types"
import { generateSortScore } from "~/lib/pgcr/riis"
import { type RaidHubInstanceExtended } from "~/services/raidhub/types"
import { Card, CardContent, CardHeader } from "~/shad/card"
import { MultiDetails } from "./multi-details"
import { MultiPlayer } from "./multi-player"
import { MultiWeaponsList } from "./multi-weapons-list"

export const MultiInstanceCombinator = (props: { data: RaidHubInstanceExtended[] }) => {
    const combined = useMemo(() => {
        const reduced = props.data.reduce<Omit<CombinedData, "overallStart" | "overallEnd">>(
            (acc, instance) => {
                acc.instances.push({
                    activityName: instance.metadata.activityName,
                    versionName: instance.metadata.versionName,
                    instanceId: instance.instanceId,
                    duration: instance.duration,
                    start: new Date(instance.dateStarted),
                    end: new Date(instance.dateCompleted),
                    completed: instance.completed
                })

                acc.duration += instance.duration
                if (instance.completed) {
                    acc.completions += 1
                }

                instance.players.forEach(player => {
                    const existingPlayer = acc.players.get(player.playerInfo.membershipId)

                    const playerWeapons =
                        existingPlayer?.weapons ?? new Collection<number, CombinedWeaponData>()

                    const characters = player.characters.reduce((charAcc, char) => {
                        const existingChar = charAcc.get(char.characterId)

                        char.weapons.forEach(weap => {
                            playerWeapons.set(weap.weaponHash, {
                                hash: weap.weaponHash,
                                kills:
                                    weap.kills + (playerWeapons.get(weap.weaponHash)?.kills ?? 0),
                                precisionKills:
                                    weap.precisionKills +
                                    (playerWeapons.get(weap.weaponHash)?.precisionKills ?? 0)
                            })
                            acc.weapons.set(weap.weaponHash, {
                                hash: weap.weaponHash,
                                kills: weap.kills + (acc.weapons.get(weap.weaponHash)?.kills ?? 0),
                                precisionKills:
                                    weap.precisionKills +
                                    (acc.weapons.get(weap.weaponHash)?.precisionKills ?? 0)
                            })
                        })

                        if (existingChar) {
                            existingChar.timePlayedSeconds += char.timePlayedSeconds
                            existingChar.score += char.score
                            existingChar.kills += char.kills
                            existingChar.deaths += char.deaths
                            existingChar.assists += char.assists
                            existingChar.precisionKills += char.precisionKills
                            existingChar.superKills += char.superKills
                            existingChar.grenadeKills += char.grenadeKills
                            existingChar.meleeKills += char.meleeKills
                        } else {
                            charAcc.set(char.characterId, {
                                classHash: char.classHash,
                                startSeconds: 0,
                                completed: char.completed,
                                timePlayedSeconds: char.timePlayedSeconds,
                                score: char.score,
                                kills: char.kills,
                                deaths: char.deaths,
                                assists: char.assists,
                                precisionKills: char.precisionKills,
                                superKills: char.superKills,
                                grenadeKills: char.grenadeKills,
                                meleeKills: char.meleeKills
                            })
                        }
                        return charAcc
                    }, existingPlayer?.characters ?? new Collection<string, CombinedCharacterStats>())

                    const { kills, deaths, assists } = player.characters.reduce(
                        (stats, char) => {
                            stats.kills += char.kills
                            stats.deaths += char.deaths
                            stats.assists += char.assists
                            return stats
                        },
                        { kills: 0, deaths: 0, assists: 0 }
                    )

                    if (existingPlayer) {
                        acc.players.set(player.playerInfo.membershipId, {
                            kills: existingPlayer.kills + kills,
                            deaths: existingPlayer.deaths + deaths,
                            assists: existingPlayer.assists + assists,
                            playerInfo: player.playerInfo,
                            characters,
                            completions: +player.completed + existingPlayer.completions,
                            timePlayedSeconds:
                                player.timePlayedSeconds + existingPlayer.timePlayedSeconds,
                            riis: 0,
                            weapons: playerWeapons
                        })
                    } else {
                        return acc.players.set(player.playerInfo.membershipId, {
                            kills,
                            deaths,
                            assists,
                            playerInfo: player.playerInfo,
                            characters,
                            completions: +player.completed,
                            timePlayedSeconds: player.timePlayedSeconds,
                            riis: 0,
                            weapons: playerWeapons
                        })
                    }
                })

                return acc
            },
            {
                instances: [],
                duration: 0,
                completions: 0,
                players: new Collection<string, CombinedPlayerStats>(),
                weapons: new Collection<number, CombinedWeaponData>()
            }
        )

        reduced.players.forEach(player => {
            // Calculate the RIIS score for each player
            player.riis = generateSortScore(
                {
                    characters: Object.freeze(Array.from(player.characters.values())),
                    timePlayedSeconds: player.timePlayedSeconds
                },
                {
                    capTPS: false
                }
            )
        })

        return {
            ...reduced,
            players: reduced.players.sort((a, b) =>
                a.completions === b.completions ? b.riis - a.riis : b.completions - a.completions
            ),
            dates: reduced.instances.sort((a, b) => a.start.getTime() - b.start.getTime()),
            overallStart: reduced.instances.reduce(
                (min, d) => (d.start < min ? d.start : min),
                new Date("9999-12-31")
            ),
            overallEnd: reduced.instances.reduce(
                (max, d) => (d.end > max ? d.end : max),
                new Date(0)
            )
        }
    }, [props.data])

    return (
        <Card>
            <CardHeader>
                <MultiDetails data={combined} />
            </CardHeader>
            <CardContent>
                <div className="text-muted-foreground ml-108 hidden items-center gap-6 text-sm md:flex">
                    <div className="w-12 text-center">KILLS</div>
                    <div className="w-12 text-center">DEATHS</div>
                    <div className="hidden w-12 text-center lg:block">ASSISTS</div>
                    <div className="hidden w-28 text-center lg:block">TIME PLAYED</div>
                    <div className="hidden w-16 text-center xl:block">RIIS</div>
                </div>
                <div className="mb-6 grid grid-cols-1 gap-4 pt-4">
                    {combined.players.map((p, membershipId) => (
                        <MultiPlayer key={membershipId} player={p} />
                    ))}
                </div>

                <div className="bg-background/50 p-2">
                    <MultiWeaponsList weapons={Array.from(combined.weapons.values())} />
                </div>
            </CardContent>
        </Card>
    )
}
