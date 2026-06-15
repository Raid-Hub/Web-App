import { type RaidHubInstanceExtended, type RaidHubPlayerInfo } from "~/services/raidhub/types"

export const CLUSTER_GUARDIAN_DISPLAY_LIMIT = 10

export type ClusterGuardian = {
    playerInfo: RaidHubPlayerInfo
    timePlayedSeconds: number
    classHashes: number[]
    isProfilePlayer: boolean
}

const CLASS_HASH_ORDER = [3655393761, 671679327, 2271682572]

const sortClassHashes = (hashes: readonly number[]): number[] =>
    [...hashes].sort((a, b) => {
        const ai = CLASS_HASH_ORDER.indexOf(a)
        const bi = CLASS_HASH_ORDER.indexOf(b)
        if (ai === -1 && bi === -1) return a - b
        if (ai === -1) return 1
        if (bi === -1) return -1
        return ai - bi
    })

const collectPlayerClassHashes = (
    characters: RaidHubInstanceExtended["players"][number]["characters"]
): number[] => {
    const hashes = new Set<number>()
    for (const character of characters) {
        if (character.classHash != null) {
            hashes.add(character.classHash)
        }
    }
    return sortClassHashes([...hashes])
}

const mergeClassHashes = (existing: readonly number[], incoming: readonly number[]): number[] =>
    sortClassHashes([...new Set([...existing, ...incoming])])

/** Union of players across instances, deduped by membershipId with aggregated playtime. */
export const mergeClusterGuardians = (
    instances: readonly RaidHubInstanceExtended[],
    profileMembershipIds: ReadonlySet<string> = new Set()
): ClusterGuardian[] => {
    const totals = new Map<string, ClusterGuardian>()

    for (const instance of instances) {
        for (const player of instance.players) {
            const membershipId = player.playerInfo.membershipId
            const playerClassHashes = collectPlayerClassHashes(player.characters)
            const existing = totals.get(membershipId)
            if (existing) {
                existing.timePlayedSeconds += player.timePlayedSeconds
                existing.classHashes = mergeClassHashes(existing.classHashes, playerClassHashes)
            } else {
                totals.set(membershipId, {
                    playerInfo: player.playerInfo,
                    timePlayedSeconds: player.timePlayedSeconds,
                    classHashes: playerClassHashes,
                    isProfilePlayer: profileMembershipIds.has(membershipId)
                })
            }
        }
    }

    return [...totals.values()].sort((a, b) => b.timePlayedSeconds - a.timePlayedSeconds)
}

export const getActivityClusterInstanceIds = (instanceIds: readonly string[]) => [
    ...new Set(instanceIds)
]
