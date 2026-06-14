import { useMemo } from "react"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { getLeaderboardRaceBadges } from "~/lib/pgcr/leaderboard-tag"
import { Tag } from "~/models/tag"
import { usePGCRContext } from "./ClientStateManager"

export const usePGCRTags = () => {
    const { data: activity, selectedFeats } = usePGCRContext()
    const { isChallengeMode, feats } = useRaidHubManifest()

    return useMemo(() => {
        if (!activity) return []

        const tags = new Array<{ tag: Tag | string; placement?: number | null; key: string }>()

        getLeaderboardRaceBadges(
            {
                isGauntletRace: activity.isGauntletRace,
                isDayOne: activity.isDayOne,
                isContest: activity.isContest,
                isPantheon: activity.isPantheon,
                versionId: activity.versionId,
                leaderboardRank: activity.leaderboardRank,
                versionName: activity.metadata.versionName
            },
            isChallengeMode
        ).forEach(badge => {
            tags.push({
                tag: badge.label,
                placement: badge.placement,
                key: badge.key
            })
        })

        if (activity.playerCount === 1) tags.push({ tag: Tag.SOLO, key: "solo" })
        else if (activity.playerCount === 2) tags.push({ tag: Tag.DUO, key: "duo" })
        else if (activity.playerCount === 3) tags.push({ tag: Tag.TRIO, key: "trio" })
        if (activity.flawless) tags.push({ tag: Tag.FLAWLESS, key: "flawless" })
        if (selectedFeats.length === feats.length) tags.push({ tag: Tag.ALL_FEATS, key: "all-feats" })

        return tags
    }, [activity, feats, selectedFeats, isChallengeMode])
}
