import { useMemo } from "react"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { Tag } from "~/models/tag"
import { usePGCRContext } from "./ClientStateManager"

export const usePGCRTags = () => {
    const { data: activity, selectedFeats } = usePGCRContext()
    const { isChallengeMode, feats } = useRaidHubManifest()

    return useMemo(() => {
        if (!activity) return []

        const tags = new Array<{ tag: Tag; placement?: number | null }>()
        if (isChallengeMode(activity.versionId)) {
            tags.push({
                tag: Tag.CHALLENGE,
                placement: activity.leaderboardRank
            })
        } else if (activity.isDayOne) {
            tags.push({ tag: Tag.DAY_ONE, placement: activity.leaderboardRank })
        } else if (activity.isContest && !!activity.leaderboardRank) {
            tags.push({ tag: Tag.CONTEST, placement: activity.leaderboardRank })
        }
        if (activity.playerCount === 1) tags.push({ tag: Tag.SOLO })
        else if (activity.playerCount === 2) tags.push({ tag: Tag.DUO })
        else if (activity.playerCount === 3) tags.push({ tag: Tag.TRIO })
        if (activity.flawless) tags.push({ tag: Tag.FLAWLESS })
        if (selectedFeats.length === feats.length) tags.push({ tag: Tag.ALL_FEATS })

        return tags
    }, [activity, feats, selectedFeats, isChallengeMode])
}
