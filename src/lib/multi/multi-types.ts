import { type Collection } from "@discordjs/collection"
import { type RaidHubPlayerInfo } from "~/services/raidhub/types"

export type CombinedData = {
    instances: {
        instanceId: string
        duration: number
        start: Date
        end: Date
        activityName: string
        versionName: string
        completed: boolean
    }[]
    overallStart: Date
    overallEnd: Date
    duration: number
    players: Collection<string, CombinedPlayerStats>
    completions: number
    weapons: Collection<number, CombinedWeaponData>
}

export type CombinedPlayerStats = {
    playerInfo: RaidHubPlayerInfo
    characters: Collection<string, CombinedCharacterStats>
    completions: number
    timePlayedSeconds: number
    kills: number
    deaths: number
    assists: number
    riis: number
    weapons: Collection<number, CombinedWeaponData>
}

export type CombinedCharacterStats = {
    classHash: number | null
    startSeconds: number
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
}

export type CombinedWeaponData = { hash: number; kills: number; precisionKills: number }
