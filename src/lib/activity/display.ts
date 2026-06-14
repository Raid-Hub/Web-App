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
    pantheonVersions: readonly number[]
}

export type ActivityDisplayParts = {
    title: string
    tags: string[]
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
    } else if (!activity.fresh && !activity.flawless && activity.playerCount > 3) {
        tags.push(Tag.CHECKPOINT)
    }

    if (opts?.excludeTitle) {
        return tags.length > 0 ? { title: "", tags } : null
    }

    const title = isPantheon
        ? opts?.pantheonTitleStyle === "full"
            ? getPantheonDisplayName(activityName, versionName)
            : versionName
        : activityName

    return { title, tags }
}

export const formatActivityDisplayParts = ({ title, tags }: ActivityDisplayParts): string => {
    if (!title) {
        return tags.join(" ")
    }
    if (tags.length === 0) {
        return title
    }
    return [title, ...tags].join(" ")
}
