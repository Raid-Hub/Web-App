import { type Collection } from "@discordjs/collection"
import { useMemo } from "react"
import { clusterActivityHistory, groupSessionsByDay } from "~/lib/activity/sessions"
import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"

export const useActivitySessions = (
    activities: Collection<string, RaidHubInstanceForPlayer>,
    visibleSessionCount: number
) => {
    return useMemo(() => {
        const sessions = clusterActivityHistory(Array.from(activities.values()))
        const visibleSessions = sessions.slice(0, visibleSessionCount)
        return {
            sessions: visibleSessions,
            dayGroups: groupSessionsByDay(visibleSessions),
            totalSessions: sessions.length,
            hasMore: sessions.length > visibleSessionCount
        }
    }, [activities, visibleSessionCount])
}
