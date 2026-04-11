import type { MultiInstanceTimelineSegment } from "~/lib/multi/multi-types"
import type {
    RaidHubInstanceCharacter,
    RaidHubInstanceExtended,
    RaidHubInstancePlayerExtended
} from "~/services/raidhub/types"

type InstanceCharacterWeapon = RaidHubInstanceCharacter["weapons"][number]

function segmentFromInstance(instance: RaidHubInstanceExtended): MultiInstanceTimelineSegment {
    return {
        instanceId: instance.instanceId,
        duration: instance.duration,
        start: new Date(instance.dateStarted),
        end: new Date(instance.dateCompleted),
        activityName: instance.metadata.activityName,
        versionName: instance.metadata.versionName,
        completed: instance.completed
    }
}

function mergeWeaponLists(
    a: readonly InstanceCharacterWeapon[],
    b: readonly InstanceCharacterWeapon[]
): InstanceCharacterWeapon[] {
    const map = new Map<number, InstanceCharacterWeapon>()
    for (const w of [...a, ...b]) {
        const prev = map.get(w.weaponHash)
        map.set(w.weaponHash, {
            weaponHash: w.weaponHash,
            kills: (prev?.kills ?? 0) + w.kills,
            precisionKills: (prev?.precisionKills ?? 0) + w.precisionKills
        })
    }
    return [...map.values()]
}

function mergeCharacterStats(
    existing: RaidHubInstanceCharacter,
    incoming: RaidHubInstanceCharacter
): RaidHubInstanceCharacter {
    return {
        characterId: existing.characterId,
        classHash: existing.classHash ?? incoming.classHash,
        emblemHash: incoming.emblemHash ?? existing.emblemHash,
        completed: existing.completed && incoming.completed,
        timePlayedSeconds: existing.timePlayedSeconds + incoming.timePlayedSeconds,
        startSeconds: Math.min(existing.startSeconds, incoming.startSeconds),
        score: existing.score + incoming.score,
        kills: existing.kills + incoming.kills,
        deaths: existing.deaths + incoming.deaths,
        assists: existing.assists + incoming.assists,
        precisionKills: existing.precisionKills + incoming.precisionKills,
        superKills: existing.superKills + incoming.superKills,
        grenadeKills: existing.grenadeKills + incoming.grenadeKills,
        meleeKills: existing.meleeKills + incoming.meleeKills,
        weapons: mergeWeaponLists(existing.weapons, incoming.weapons)
    }
}

type PlayerMergeAcc = {
    playerInfo: RaidHubInstancePlayerExtended["playerInfo"]
    characters: Map<string, RaidHubInstanceCharacter>
    completions: number
    instancesParticipated: number
    isFirstClear: boolean
    sherpas: number
    timePlayedSeconds: number
}

function mergeNullableBool(values: readonly (boolean | null)[]): boolean | null {
    if (values.length === 0) return null
    if (values.every(v => v === true)) return true
    if (values.every(v => v === false)) return false
    if (values.every(v => v === null)) return null
    return false
}

/**
 * Merges multiple PGCR instances (same fireteam session) into one synthetic {@link RaidHubInstanceExtended}
 * so the standard PGCR UI can render aggregated stats.
 */
export function mergeRaidHubInstances(
    instances: RaidHubInstanceExtended[],
    multiId: string
): {
    merged: RaidHubInstanceExtended
    timeline: MultiInstanceTimelineSegment[]
} {
    const sorted = [...instances].sort(
        (a, b) => new Date(a.dateStarted).getTime() - new Date(b.dateStarted).getTime()
    )

    const timeline = sorted.map(segmentFromInstance)

    if (sorted.length === 0) {
        throw new Error("mergeRaidHubInstances: empty instances")
    }

    if (sorted.length === 1) {
        const only = sorted[0]
        return { merged: only, timeline }
    }

    const first = sorted[0]
    const last = sorted[sorted.length - 1]

    const playerMap = new Map<string, PlayerMergeAcc>()

    for (const instance of sorted) {
        for (const player of instance.players) {
            const existing = playerMap.get(player.playerInfo.membershipId)
            const charMap = new Map<string, RaidHubInstanceCharacter>()
            for (const c of player.characters) {
                charMap.set(c.characterId, c)
            }

            if (!existing) {
                playerMap.set(player.playerInfo.membershipId, {
                    playerInfo: player.playerInfo,
                    characters: charMap,
                    completions: player.completed ? 1 : 0,
                    instancesParticipated: 1,
                    isFirstClear: player.isFirstClear,
                    sherpas: player.sherpas,
                    timePlayedSeconds: player.timePlayedSeconds
                })
            } else {
                existing.completions += player.completed ? 1 : 0
                existing.instancesParticipated += 1
                existing.isFirstClear = existing.isFirstClear || player.isFirstClear
                existing.sherpas += player.sherpas
                existing.timePlayedSeconds += player.timePlayedSeconds
                existing.playerInfo = player.playerInfo

                for (const c of player.characters) {
                    const prevChar = existing.characters.get(c.characterId)
                    existing.characters.set(
                        c.characterId,
                        prevChar ? mergeCharacterStats(prevChar, c) : c
                    )
                }
            }
        }
    }

    const players: RaidHubInstancePlayerExtended[] = [...playerMap.values()].map(acc => ({
        playerInfo: acc.playerInfo,
        completed: acc.completions === acc.instancesParticipated,
        isFirstClear: acc.isFirstClear,
        sherpas: acc.sherpas,
        timePlayedSeconds: acc.timePlayedSeconds,
        characters: [...acc.characters.values()]
    }))

    const merged: RaidHubInstanceExtended = {
        ...first,
        instanceId: `multi:${multiId}`,
        completed: sorted.every(i => i.completed),
        flawless: mergeNullableBool(sorted.map(i => i.flawless)),
        fresh: mergeNullableBool(sorted.map(i => i.fresh)),
        playerCount: players.length,
        skullHashes: [...new Set(sorted.flatMap(i => [...i.skullHashes]))],
        score: sorted.reduce((s, i) => s + i.score, 0),
        dateStarted: first.dateStarted,
        dateCompleted: last.dateCompleted,
        season: first.season,
        duration: sorted.reduce((s, i) => s + i.duration, 0),
        platformType: first.platformType,
        activityId: first.activityId,
        versionId: first.versionId,
        isDayOne: sorted.every(i => i.isDayOne),
        isContest: sorted.every(i => i.isContest),
        isWeekOne: sorted.every(i => i.isWeekOne),
        isBlacklisted: sorted.some(i => i.isBlacklisted),
        leaderboardRank: null,
        metadata: first.metadata,
        players
    }

    return { merged, timeline }
}
