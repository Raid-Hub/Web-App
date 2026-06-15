import { getPantheonDisplayName } from "~/lib/pgcr/formatting"
import { Tag } from "~/models/tag"

export type ActivityDisplayInput = {
    activityId: number
    playerCount: number
    fresh: boolean | null
    flawless: boolean | null
    versionId: number
    isContest: boolean
    completed: boolean
}

export type ActivityDisplayContext = {
    getActivityString: (activityId: number) => string
    getVersionString: (versionId: number) => string
    getCheckpointName: (activityId: number, versionId?: number) => string | null
    pantheonVersions: readonly number[]
}

export type ActivityDisplayParts = {
    title: string
    versionLabel: string | null
    tags: string[]
}

/** Version-specific labels (Challenge, etc.) that belong in the title, not attempt tags. */
export const getIntrinsicVersionLabel = (
    versionId: number,
    versionName: string,
    isContest: boolean
): string | null => {
    if (isContest || versionName === Tag.CONTEST || versionName === Tag.MASTER) {
        return null
    }

    if (versionId === 1 || versionName === "Unknown") {
        return null
    }

    return versionName
}

export const getActivityDisplayParts = (
    activity: ActivityDisplayInput,
    ctx: ActivityDisplayContext,
    opts?: {
        includeFresh?: boolean
        excludeTitle?: boolean
        /** History rows use the boss name alone; PGCR-style titles elsewhere. */
        pantheonTitleStyle?: "boss" | "full"
    }
): ActivityDisplayParts | null => {
    const activityName = ctx.getActivityString(activity.activityId)
    const versionName = ctx.getVersionString(activity.versionId)
    const isPantheon = ctx.pantheonVersions.includes(activity.versionId)
    const tags: string[] = []

    const wishWall =
        activityName === "Last Wish" &&
        activity.playerCount <= 2 &&
        activity.fresh &&
        activity.completed

    if (activity.completed) {
        if (activity.fresh && !activity.flawless && opts?.includeFresh) {
            tags.push(Tag.FRESH)
        }
        switch (activity.playerCount) {
            case 1:
                tags.push(Tag.SOLO)
                break
            case 2:
                tags.push(Tag.DUO)
                break
            case 3:
                tags.push(Tag.TRIO)
                break
        }
        if (activity.flawless) {
            tags.push(Tag.FLAWLESS)
        }
    }

    if (versionName === "Master") {
        tags.push(Tag.MASTER)
    } else if (activity.isContest) {
        tags.push(Tag.CONTEST)
    }

    if (wishWall) {
        tags.push("Wish Wall")
    } else if (!activity.fresh && !activity.flawless) {
        if (activity.completed && activity.playerCount <= 3) {
            const checkpointName = ctx.getCheckpointName(activity.activityId, activity.versionId)
            if (checkpointName) {
                tags.push(checkpointName)
            }
        } else if (activity.playerCount > 3) {
            tags.push(Tag.CHECKPOINT)
        }
    }

    if (opts?.excludeTitle) {
        return tags.length > 0 ? { title: "", versionLabel: null, tags } : null
    }

    const baseTitle = isPantheon
        ? opts?.pantheonTitleStyle === "full"
            ? getPantheonDisplayName(activityName, versionName)
            : versionName
        : activityName

    const versionLabel = getIntrinsicVersionLabel(
        activity.versionId,
        versionName,
        activity.isContest
    )
    const showVersionLabel = versionLabel && !isPantheon ? versionLabel : null

    return { title: baseTitle, versionLabel: showVersionLabel, tags }
}

export const formatActivityDisplayParts = ({
    title,
    versionLabel,
    tags
}: ActivityDisplayParts): string => {
    const titleText = [title, versionLabel].filter(Boolean).join(" ")

    if (!titleText) {
        return tags.join(" ")
    }
    if (tags.length === 0) {
        return titleText
    }
    return [titleText, ...tags].join(" ")
}
