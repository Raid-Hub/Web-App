export type PGCRPageProps = {
    params: {
        instanceId: string
    }
}

export type PGCRPageParams = {
    player?: string
    character?: string
}

export interface PlayerStats {
    kills: number
    deaths: number
    assists: number
    timePlayedSeconds: number
    precisionKills: number
    superKills: number
    meleeKills: number
    grenadeKills: number
}
