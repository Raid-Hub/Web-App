import { PANTHEON_COMMUNITY_RACE_VERSION_ID } from "~/lib/manifest/pantheon"
import { Tag } from "~/models/tag"

type LeaderboardTagActivity = {
    isGauntletRace?: boolean
    isDayOne?: boolean
    isContest?: boolean
    isPantheon?: boolean
    versionId?: number
    leaderboardRank?: number | null
    versionName?: string
}

export type LeaderboardRaceBadge = {
    label: string
    placement?: number | null
    key: string
}

/** Insurrection Prime Revolutionary — version-first rank is never shown as a Day One #. */
export const suppressesDayOnePlacement = (versionId?: number) =>
    versionId === PANTHEON_COMMUNITY_RACE_VERSION_ID

export const getLeaderboardRaceBadges = (
    activity: LeaderboardTagActivity,
    isChallengeMode: (versionId: number) => boolean
): LeaderboardRaceBadge[] => {
    const badges: LeaderboardRaceBadge[] = []
    const rank = activity.leaderboardRank

    if (activity.isGauntletRace && rank) {
        return [
            {
                label: Tag.GAUNTLET_RACE,
                placement: rank,
                key: "gauntlet-race"
            }
        ]
    }

    if (activity.isDayOne) {
        badges.push({
            label: Tag.DAY_ONE,
            placement: suppressesDayOnePlacement(activity.versionId) ? null : rank,
            key: "day-one"
        })
        return badges
    }

    if (!rank) {
        return badges
    }

    if (activity.versionId != null && isChallengeMode(activity.versionId)) {
        badges.push({
            label: Tag.CHALLENGE,
            placement: rank,
            key: "challenge"
        })
    } else if (activity.isContest) {
        badges.push({
            label: Tag.CONTEST,
            placement: rank,
            key: "contest"
        })
    } else if (activity.isPantheon && activity.versionName) {
        badges.push({
            label: activity.versionName,
            placement: rank,
            key: `pantheon-${activity.versionId ?? activity.versionName}`
        })
    }

    return badges
}

/** Primary labeled badge for OG images and metadata (prefers a numeric placement). */
export const getLeaderboardRaceBadge = (
    activity: LeaderboardTagActivity,
    isChallengeMode: (versionId: number) => boolean
): LeaderboardRaceBadge | null => {
    const badges = getLeaderboardRaceBadges(activity, isChallengeMode)
    return badges.find(b => b.placement != null) ?? badges[0] ?? null
}

export const formatLeaderboardRaceLabel = (
    activity: LeaderboardTagActivity,
    isChallengeMode: (versionId: number) => boolean
): string | null => {
    const badge = getLeaderboardRaceBadge(activity, isChallengeMode)
    if (!badge) {
        return null
    }

    return badge.placement != null ? `${badge.label} #${badge.placement}` : badge.label
}
