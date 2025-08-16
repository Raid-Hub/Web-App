import { notFound } from "next/navigation"
import { Tag } from "~/models/tag"
import { RaidHubError } from "~/services/raidhub/RaidHubError"
import { getRaidHubApi } from "~/services/raidhub/common"
import { type RaidHubInstanceExtended } from "~/services/raidhub/types"
import { reactRequestDedupe } from "~/util/react-cache"

export const assertValidPath = (instanceId: string) => {
    if (!/^\d+$/.test(instanceId)) {
        notFound()
    }
}

export const prefetchActivity = reactRequestDedupe((instanceId: string) =>
    getRaidHubApi("/instance/{instanceId}", { instanceId }, null)
        .then(res => res.response)
        .catch(err => {
            if (err instanceof RaidHubError && err.errorCode === "InstanceNotFoundError") {
                notFound()
            } else {
                throw err
            }
        })
)

export const getMetaData = (activity: RaidHubInstanceExtended) => {
    const lowmanPrefix = activity.completed
        ? activity.playerCount === 1
            ? Tag.SOLO
            : activity.playerCount === 2
              ? Tag.DUO
              : activity.playerCount === 3
                ? Tag.TRIO
                : null
        : null
    const flawlessPrefix = activity.flawless ? "Flawless" : null

    const versionPrefix = activity.versionId === 1 ? null : activity.metadata.versionName

    const activityName = activity.metadata.activityName

    const resultSuffix = activity.completed
        ? activity.fresh === false
            ? "checkpoint cleared on"
            : "completed on"
        : "attempted on"

    const placementSuffix = activity.leaderboardRank ? `#${activity.leaderboardRank}` : null

    const dateCompleted = new Date(activity.dateCompleted)

    const dateString = dateCompleted.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: "America/Los_Angeles",
        timeZoneName: "short"
    })

    const idTitle = [activity.metadata.activityName, activity.instanceId].filter(Boolean).join(" ")

    const ogTitle = [
        lowmanPrefix,
        flawlessPrefix,
        activityName,
        `(${activity.metadata.versionName})`
    ]
        .filter(Boolean)
        .join(" ")

    const description = [
        lowmanPrefix,
        flawlessPrefix,
        versionPrefix,
        activityName,
        placementSuffix,
        resultSuffix,
        dateString
    ]
        .filter(Boolean)
        .join(" ")

    return {
        ogTitle,
        idTitle,
        description,
        dateString
    }
}
