import { useActivityDisplayParts } from "~/hooks/useActivityDisplayParts"
import { formatActivityDisplayParts } from "~/lib/activity/display"

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
    const parts = useActivityDisplayParts(tag, {
        includeFresh: opts?.includeFresh,
        excludeTitle: opts?.excludeRaidName,
        pantheonTitleStyle: "full"
    })

    if (!parts) {
        return null
    }

    return formatActivityDisplayParts(parts)
}
