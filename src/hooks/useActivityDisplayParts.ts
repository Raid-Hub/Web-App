import { useMemo } from "react"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import {
    type ActivityDisplayInput,
    type ActivityDisplayParts,
    getActivityDisplayParts
} from "~/lib/activity/display"

export const useActivityDisplayParts = (
    activity: ActivityDisplayInput,
    opts?: {
        includeFresh?: boolean
        excludeTitle?: boolean
        pantheonTitleStyle?: "boss" | "full"
    }
): ActivityDisplayParts | null => {
    const { getActivityString, getVersionString, pantheonVersions } = useRaidHubManifest()
    const { includeFresh, excludeTitle, pantheonTitleStyle } = opts ?? {}

    return useMemo(
        () =>
            getActivityDisplayParts(
                activity,
                { getActivityString, getVersionString, pantheonVersions },
                { includeFresh, excludeTitle, pantheonTitleStyle }
            ),
        [
            activity,
            excludeTitle,
            getActivityString,
            getVersionString,
            includeFresh,
            pantheonTitleStyle,
            pantheonVersions
        ]
    )
}
