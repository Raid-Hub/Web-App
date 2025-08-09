"use client"

import { Collection } from "@discordjs/collection"
import { useMemo } from "react"
import { type RaidHubInstanceExtended, type RaidHubPlayerInfo } from "~/services/raidhub/types"
import { useRaidHubInstanceList } from "~/services/raidhub/useRaidHubInstance"

export const MultiLoader = ({ name, instances }: { name: string; instances: string[] }) => {
    const queries = useRaidHubInstanceList(instances)

    const progress = 1 - queries.filter(q => q.isLoading).length / queries.length
    const isLoading = queries.some(q => q.isLoading)

    if (isLoading) {
        return (
            <div className="flex w-full flex-col items-center justify-center">
                {/* Progress bar shows how many instances have finished loading for the user */}
                <span className="text-primary mb-2 text-sm">
                    Loading data: {Math.round(progress * 100)}%
                </span>
                <div className="relative h-2 w-full rounded bg-gray-200">
                    {/* The filled part represents the percentage of loaded instances */}
                    <div
                        className="bg-raidhub absolute top-0 left-0 h-2 rounded"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>
            </div>
        )
    }
    return <MultiInstanceCombinator data={queries.map(q => q.data!).filter(Boolean)} />
}

type CombinedCharacterStats = {
    completed: boolean
    timePlayedSeconds: number
    score: number
    kills: number
    deaths: number
    assists: number
    precisionKills: number
    superKills: number
    grenadeKills: number
    meleeKills: number
    weapons: Collection<number, { kills: number; precisionKills: number }>
}

const MultiInstanceCombinator = (props: { data: RaidHubInstanceExtended[] }) => {
    const combined = useMemo(() => {
        return props.data.reduce(
            (acc, instance) => {
                const started = new Date(instance.dateStarted)
                if (started < acc.dateStarted) {
                    acc.dateStarted = started
                }
                const completed = new Date(instance.dateCompleted)
                if (completed > acc.dateCompleted) {
                    acc.dateCompleted = completed
                }
                acc.duration += instance.duration
                instance.players.forEach(player => {
                    const existingPlayer = acc.players.get(player.playerInfo.membershipId)

                    const characters = player.characters.reduce((charAcc, char) => {
                        const existingChar = charAcc.get(char.characterId)

                        const weapons = char.weapons.reduce((weapAcc, weap) => {
                            weapAcc.set(weap.weaponHash, {
                                kills: weap.kills + (weapAcc.get(weap.weaponHash)?.kills ?? 0),
                                precisionKills:
                                    weap.precisionKills +
                                    (weapAcc.get(weap.weaponHash)?.precisionKills ?? 0)
                            })
                            return weapAcc
                        }, existingChar?.weapons ?? new Collection<number, { kills: number; precisionKills: number }>())

                        if (existingChar) {
                            existingChar.timePlayedSeconds += char.timePlayedSeconds
                            existingChar.score += char.timePlayedSeconds
                            existingChar.kills += char.kills
                            existingChar.deaths += char.deaths
                            existingChar.assists += char.assists
                            existingChar.precisionKills += char.precisionKills
                            existingChar.superKills += char.superKills
                            existingChar.grenadeKills += char.grenadeKills
                            existingChar.meleeKills += char.meleeKills
                        } else {
                            charAcc.set(char.characterId, {
                                completed: char.completed,
                                timePlayedSeconds: char.timePlayedSeconds,
                                score: char.timePlayedSeconds,
                                kills: char.kills,
                                deaths: char.deaths,
                                assists: char.assists,
                                precisionKills: char.precisionKills,
                                superKills: char.superKills,
                                grenadeKills: char.grenadeKills,
                                meleeKills: char.meleeKills,
                                weapons
                            })
                        }
                        return charAcc
                    }, existingPlayer?.characters ?? new Collection<string, CombinedCharacterStats>())

                    if (existingPlayer) {
                        acc.players.set(player.playerInfo.membershipId, {
                            playerInfo: player.playerInfo,
                            characters,
                            completed: player.completed || existingPlayer.completed,
                            timePlayedSeconds:
                                player.timePlayedSeconds + existingPlayer.timePlayedSeconds
                        })
                    } else {
                        return acc.players.set(player.playerInfo.membershipId, {
                            playerInfo: player.playerInfo,
                            characters,
                            completed: player.completed,
                            timePlayedSeconds: player.timePlayedSeconds
                        })
                    }
                })

                return acc
            },
            {
                dateStarted: new Date("2099-01-01T00:00:00Z"),
                dateCompleted: new Date(0),
                duration: 0,
                players: new Collection<
                    string,
                    {
                        playerInfo: RaidHubPlayerInfo
                        characters: Collection<string, CombinedCharacterStats>
                        completed: boolean
                        timePlayedSeconds: number
                    }
                >()
            }
        )
    }, [props.data])

    return <pre>{JSON.stringify(combined, null, 2)}</pre>
}
