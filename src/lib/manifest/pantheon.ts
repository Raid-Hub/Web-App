import type { RaidHubManifestResponse, RaidHubVersionDefinition } from "~/services/raidhub/types"

export const PANTHEON_COMMUNITY_RACE_VERSION_ID = 134

/** Pantheon checkpoint labels drop the trailing difficulty adjective, e.g. "Oryx Exalted" -> "Oryx". */
export const getPantheonCheckpointName = (versionName: string): string | null => {
    const parts = versionName.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) {
        return null
    }
    if (parts.length === 1) {
        return parts[0]
    }
    return parts.slice(0, -1).join(" ")
}

export const findPantheonVersionByPath = (
    manifest: RaidHubManifestResponse,
    versionPath: string
): RaidHubVersionDefinition | null => {
    const matches = Object.values(manifest.versionDefinitions).filter(
        version =>
            version.associatedActivityId !== null &&
            manifest.pantheonIds.includes(version.associatedActivityId) &&
            version.path === versionPath
    )

    if (matches.length === 0) {
        return null
    }

    if (matches.length === 1) {
        return matches[0]
    }

    return matches.sort((a, b) => {
        const activityA = manifest.activityDefinitions[a.associatedActivityId!]
        const activityB = manifest.activityDefinitions[b.associatedActivityId!]
        if (+activityA.isSunset ^ +activityB.isSunset) {
            return activityA.isSunset ? 1 : -1
        }
        return b.associatedActivityId! - a.associatedActivityId!
    })[0]
}

export const isPantheonVersionSunset = (
    manifest: RaidHubManifestResponse,
    versionId: number
): boolean => {
    const version = manifest.versionDefinitions[versionId]
    if (!version?.associatedActivityId) {
        return false
    }

    return manifest.activityDefinitions[version.associatedActivityId]?.isSunset ?? false
}

export const getActivePantheonIds = (manifest: RaidHubManifestResponse) =>
    manifest.pantheonIds.filter(id => !manifest.activityDefinitions[id]?.isSunset)

export const getPantheonVersionsForActivities = (
    manifest: RaidHubManifestResponse,
    activityIds: readonly number[]
) => Array.from(new Set(activityIds.flatMap(id => manifest.versionsForActivity[id] ?? [])))
