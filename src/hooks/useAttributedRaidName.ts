import { useMemo } from "react"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { Tag } from "~/models/tag"

export const useAttributedRaidName = (
    tag: {
        activityId: number
        playerCount: number
        fresh: boolean | null
        flawless: boolean | null
        versionId: number
        isContest: boolean
        completed: boolean
    },
    opts?: {
        includeFresh?: boolean
        excludeRaidName?: boolean
    }
): string | null => {
    const { getActivityString, getVersionString, pantheonVersions } = useRaidHubManifest()

    return useMemo(() => {
        const wishWall =
            getActivityString(tag.activityId) === "Last Wish" &&
            tag.playerCount <= 2 &&
            tag.fresh &&
            tag.completed
        const descriptors: string[] = []
        if (tag.completed) {
            if (tag.fresh && !tag.flawless && opts?.includeFresh) descriptors.push(Tag.FRESH)
            switch (tag.playerCount) {
                case 1:
                    descriptors.push(Tag.SOLO)
                    break
                case 2:
                    descriptors.push(Tag.DUO)
                    break
                case 3:
                    descriptors.push(Tag.TRIO)
                    break
            }
            if (tag.flawless) descriptors.push(Tag.FLAWLESS)
        }
        if (getVersionString(tag.versionId) === "Master") descriptors.push(Tag.MASTER)
        else if (tag.isContest) descriptors.push(Tag.CONTEST)
        if (!opts?.excludeRaidName) {
            descriptors.push(
                pantheonVersions.includes(tag.versionId)
                    ? getVersionString(tag.versionId)
                    : getActivityString(tag.activityId)
            )
        }
        // special cases
        if (wishWall) {
            descriptors.push("(Wish Wall)")
        } else if (!tag.fresh && !tag.flawless && tag.playerCount > 3) {
            descriptors.push("(Checkpoint)")
        }
        return descriptors.join(" ")
    }, [
        getActivityString,
        getVersionString,
        opts?.excludeRaidName,
        opts?.includeFresh,
        pantheonVersions,
        tag.activityId,
        tag.completed,
        tag.isContest,
        tag.flawless,
        tag.fresh,
        tag.playerCount,
        tag.versionId
    ])
}
