"use client"

import { useQuery } from "@tanstack/react-query"
import { createContext, useContext, useMemo, type ReactNode } from "react"
import {
    findPantheonVersionByPath as findPantheonVersionByPathInManifest,
    getActivePantheonIds,
    getPantheonVersionsForActivities,
    isPantheonVersionSunset as isPantheonVersionSunsetInManifest
} from "~/lib/manifest/pantheon"
import { getRaidHubApi } from "~/services/raidhub/common"
import type {
    ImageContentData,
    RaidHubActivityDefinition,
    RaidHubManifestResponse,
    RaidHubVersionDefinition
} from "~/services/raidhub/types"

type ManifestContextData = RaidHubManifestResponse & {
    listedVerions: readonly number[]
    activeRaids: readonly number[]
    activePantheonIds: readonly number[]
    pantheonVersions: readonly number[]
    activePantheonVersions: readonly number[]
    pantheonBossVersions: readonly number[]
    activePantheonBossVersions: readonly number[]
    gauntletVersions: readonly number[]
    activeGauntletVersions: readonly number[]
    elevatedDifficulties: readonly number[]
    milestoneHashes: Map<number, RaidHubActivityDefinition>
    getVersionString(versionId: number): string
    getActivityString(activityId: number): string
    getUrlPathForActivity(activityId: number): string | null
    getUrlPathForVersion(versionId: number): string | null
    getActivePantheonActivityId(): number | null
    isGauntletVersion(versionId: number): boolean
    isPantheonVersionSunset(versionId: number): boolean
    getDefinitionFromHash(hash: string | number): {
        activity: RaidHubActivityDefinition
        version: RaidHubVersionDefinition
    } | null
    getVersionsForActivity(activityId: number): readonly RaidHubVersionDefinition[]
    findPantheonVersionByPath(versionPath: string): RaidHubVersionDefinition | null
    getActivityDefinition(activityId: number): RaidHubActivityDefinition | null
    isChallengeMode(versionId: number): boolean
    getImageVariantsForActivity(activityId: number | string): readonly ImageContentData[]
}

const ManifestContext = createContext<ManifestContextData | undefined>(undefined)

export function RaidHubManifestManager(props: {
    children: ReactNode
    serverManifest: RaidHubManifestResponse
}) {
    const { data } = useQuery<RaidHubManifestResponse>({
        queryKey: ["raidhub-manifest"],
        queryFn: () => getRaidHubApi("/manifest", null, null).then(res => res.response),
        initialData: props.serverManifest,
        staleTime: 1000 * 3600 // 1 hour
    })

    const value = useMemo((): ManifestContextData => {
        const activePantheonIds = getActivePantheonIds(data)
        const pantheonVersions = getPantheonVersionsForActivities(data, data.pantheonIds)
        const activePantheonVersions = getPantheonVersionsForActivities(data, activePantheonIds)
        const gauntletVersions = data.gauntletVersionIds ?? []
        const gauntletVersionSet = new Set(gauntletVersions)
        const pantheonBossVersions = pantheonVersions.filter(id => !gauntletVersionSet.has(id))
        const activeGauntletVersions = gauntletVersions.filter(
            id => !isPantheonVersionSunsetInManifest(data, id)
        )
        const activePantheonBossVersions = activePantheonVersions.filter(
            id => !gauntletVersionSet.has(id)
        )

        return {
            ...data,
            listedVerions: Object.keys(data.versionDefinitions).map(Number),
            activeRaids: data.listedRaidIds.filter(id => !data.sunsetRaidIds.includes(id)),
            activePantheonIds,
            pantheonVersions,
            activePantheonVersions,
            pantheonBossVersions,
            activePantheonBossVersions,
            gauntletVersions,
            activeGauntletVersions,
            elevatedDifficulties: [3, 4],
            milestoneHashes: new Map(
                Object.entries(data.activityDefinitions)
                    .filter(([, value]) => !!value.milestoneHash)
                    .map(([, value]) => [Number(value.milestoneHash!), value])
            ),
            getVersionString(versionId) {
                return data.versionDefinitions[versionId]?.name ?? "Unknown"
            },
            getActivityString(activityId) {
                return data.activityDefinitions[activityId]?.name ?? "Unknown"
            },
            getUrlPathForActivity(activityId) {
                return data.activityDefinitions[activityId]?.path ?? null
            },
            getUrlPathForVersion(activityId) {
                return data.versionDefinitions[activityId]?.path ?? null
            },
            getActivePantheonActivityId() {
                return activePantheonIds[0] ?? null
            },
            isGauntletVersion(versionId) {
                return gauntletVersionSet.has(versionId)
            },
            isPantheonVersionSunset(versionId) {
                return isPantheonVersionSunsetInManifest(data, versionId)
            },
            getDefinitionFromHash(hash) {
                const obj = data.hashes[hash]
                if (!obj) return null

                return {
                    activity: data.activityDefinitions[obj.activityId],
                    version: data.versionDefinitions[obj.versionId]
                }
            },
            getVersionsForActivity(activityId) {
                return (data.versionsForActivity[activityId] ?? []).map(
                    v => data.versionDefinitions[v]
                )
            },
            findPantheonVersionByPath(versionPath) {
                return findPantheonVersionByPathInManifest(data, versionPath)
            },
            getActivityDefinition(activityId) {
                return data.activityDefinitions[activityId] ?? null
            },
            isChallengeMode(versionId) {
                return data.versionDefinitions[versionId]?.isChallengeMode ?? false
            },
            getImageVariantsForActivity(activityId) {
                const variants = data.splashUrls[activityId]
                return variants ?? []
            }
        }
    }, [data])

    return <ManifestContext.Provider value={value}>{props.children}</ManifestContext.Provider>
}

export function useRaidHubManifest() {
    const manifest = useContext(ManifestContext)
    if (manifest === undefined)
        throw new Error("Cannot use RaidHub manifest context outside of the provider")

    return manifest
}
