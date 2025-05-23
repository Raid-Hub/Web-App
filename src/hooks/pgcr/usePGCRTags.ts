import { useMemo } from "react"
import { useRaidHubManifest } from "~/app/layout/wrappers/RaidHubManifestManager"
import { Tag } from "~/models/tag"
import { usePGCRContext } from "./ClientStateManager"

export const usePGCRTags = () => {
    const { data: activity } = usePGCRContext()
    const { isChallengeMode } = useRaidHubManifest()

    return useMemo(() => {
        if (!activity) return []

        const tags = new Array<{ tag: Tag; placement?: number | null }>()
        if (isChallengeMode(activity.versionId)) {
            tags.push({
                tag: Tag.CHALLENGE,
                placement: activity.leaderboardRank
            })
        } else if (activity.isDayOne) {
            const placement = isChallengeMode(activity.versionId) ? null : activity.leaderboardRank
            tags.push({ tag: Tag.DAY_ONE, placement })
        }
        if (activity.playerCount === 1) tags.push({ tag: Tag.SOLO })
        else if (activity.playerCount === 2) tags.push({ tag: Tag.DUO })
        else if (activity.playerCount === 3) tags.push({ tag: Tag.TRIO })
        if (activity.flawless) tags.push({ tag: Tag.FLAWLESS })
        return tags
    }, [activity, isChallengeMode])
}
