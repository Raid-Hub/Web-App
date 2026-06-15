import { useMemo } from "react"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import {
    getActivityDisplayParts,
    type ActivityDisplayInput,
    type ActivityDisplayParts
} from "~/lib/activity/display"

export const useActivityDisplayParts = (
    activity: ActivityDisplayInput,
    opts?: {
        includeFresh?: boolean
        excludeTitle?: boolean
        pantheonTitleStyle?: "boss" | "full"
    }
): ActivityDisplayParts | null => {
    const { getActivityString, getVersionString, getCheckpointName, pantheonVersions } =
        useRaidHubManifest()
    const { includeFresh, excludeTitle, pantheonTitleStyle } = opts ?? {}

    return useMemo(
        () =>
            getActivityDisplayParts(
                activity,
                { getActivityString, getVersionString, getCheckpointName, pantheonVersions },
                { includeFresh, excludeTitle, pantheonTitleStyle }
            ),
        [
            activity,
            excludeTitle,
            getActivityString,
            getCheckpointName,
            getVersionString,
            includeFresh,
            pantheonTitleStyle,
            pantheonVersions
        ]
    )
}
