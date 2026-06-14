import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"

/** Gap before starting a new play session (same calendar day). */
export const PLAY_SESSION_GAP_MS = 4 * 60 * 60 * 1000

/** Gap before splitting clusters of the same activity within a session. */
export const ACTIVITY_CLUSTER_GAP_MS = 2 * 60 * 60 * 1000

export type ActivityCluster = {
    id: string
    activityId: number
    versionId: number
    activities: RaidHubInstanceForPlayer[]
    /** Newest completion in the cluster. */
    startedAt: Date
    /** Oldest completion in the cluster. */
    endedAt: Date
}

export type PlaySession = {
    id: string
    activities: RaidHubInstanceForPlayer[]
    clusters: ActivityCluster[]
    startedAt: Date
    endedAt: Date
}

export type ActivityClusterStats = {
    attempts: number
    clears: number
    bestClear: RaidHubInstanceForPlayer | null
    totalDurationSeconds: number
}

const isSameCalendarDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

const sortNewestFirst = (activities: readonly RaidHubInstanceForPlayer[]) =>
    [...activities]
        .filter(a => new Date(a.dateCompleted).getTime() <= Date.now())
        .sort(
            (a, b) =>
                new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime()
        )

const clusterWithinSession = (
    sessionActivities: RaidHubInstanceForPlayer[],
    clusterGapMs: number
): ActivityCluster[] => {
    const clusters: ActivityCluster[] = []

    for (const activity of sessionActivities) {
        const completed = new Date(activity.dateCompleted)
        const lastCluster = clusters.at(-1)

        if (
            lastCluster &&
            lastCluster.activityId === activity.activityId &&
            lastCluster.versionId === activity.versionId &&
            lastCluster.endedAt.getTime() - completed.getTime() < clusterGapMs
        ) {
            lastCluster.activities.push(activity)
            lastCluster.endedAt = completed
            continue
        }

        clusters.push({
            id: `${activity.instanceId}:${activity.activityId}:${activity.versionId}`,
            activityId: activity.activityId,
            versionId: activity.versionId,
            activities: [activity],
            startedAt: completed,
            endedAt: completed
        })
    }

    return clusters
}

export const clusterActivityHistory = (
    activities: readonly RaidHubInstanceForPlayer[],
    opts?: {
        playSessionGapMs?: number
        activityClusterGapMs?: number
    }
): PlaySession[] => {
    const playGap = opts?.playSessionGapMs ?? PLAY_SESSION_GAP_MS
    const clusterGap = opts?.activityClusterGapMs ?? ACTIVITY_CLUSTER_GAP_MS
    const sorted = sortNewestFirst(activities)

    const sessions: PlaySession[] = []
    let current: RaidHubInstanceForPlayer[] = []

    const flush = () => {
        if (current.length === 0) return
        const first = current[0]
        const last = current[current.length - 1]
        if (!first || !last) return

        sessions.push({
            id: first.dateCompleted,
            activities: current,
            clusters: clusterWithinSession(current, clusterGap),
            startedAt: new Date(first.dateCompleted),
            endedAt: new Date(last.dateCompleted)
        })
        current = []
    }

    for (const activity of sorted) {
        const completed = new Date(activity.dateCompleted)

        if (current.length === 0) {
            current = [activity]
            continue
        }

        const previousActivity = current[current.length - 1]
        if (!previousActivity) {
            current = [activity]
            continue
        }

        const previous = new Date(previousActivity.dateCompleted)
        const gap = previous.getTime() - completed.getTime()

        if (gap < playGap && isSameCalendarDay(previous, completed)) {
            current.push(activity)
        } else {
            flush()
            current = [activity]
        }
    }

    flush()
    return sessions
}

export const getActivityClusterStats = (cluster: ActivityCluster): ActivityClusterStats => {
    const clears = cluster.activities.filter(a => a.player.completed)
    const bestClear =
        clears.length > 0
            ? clears.reduce((best, activity) =>
                  activity.duration < best.duration ? activity : best
              )
            : null

    return {
        attempts: cluster.activities.length,
        clears: clears.length,
        bestClear,
        totalDurationSeconds: cluster.activities.reduce((sum, a) => sum + a.duration, 0)
    }
}

export const getPlaySessionSpanSeconds = (session: PlaySession) => {
    const newestEnd = session.startedAt.getTime()
    const oldestEnd = session.endedAt.getTime()
    const oldestDuration =
        session.activities[session.activities.length - 1]?.duration ?? 0
    const spanMs = newestEnd - oldestEnd + oldestDuration * 1000
    return Math.max(0, Math.round(spanMs / 1000))
}

export const groupSessionsByDay = (sessions: PlaySession[]) => {
    const groups = new Map<string, PlaySession[]>()

    for (const session of sessions) {
        const key = session.startedAt.toISOString().slice(0, 10)
        const bucket = groups.get(key)
        if (bucket) {
            bucket.push(session)
        } else {
            groups.set(key, [session])
        }
    }

    return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a))
}
