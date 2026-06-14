"use client"

import { type Collection } from "@discordjs/collection"
import { useState } from "react"
import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { ActivityHistoryView } from "./history/ActivityHistoryView"

const INITIAL_SESSION_COUNT = 12
const SESSION_PAGE_SIZE = 8

export const ActivityHistoryLayout = ({
    activities,
    isLoading
}: {
    activities: Collection<string, RaidHubInstanceForPlayer>
    isLoading: boolean
}) => {
    const [visibleSessions, setVisibleSessions] = useState(INITIAL_SESSION_COUNT)

    return (
        <ActivityHistoryView
            activities={activities}
            visibleSessionCount={visibleSessions}
            isLoading={isLoading}
            onLoadMore={() => setVisibleSessions(count => count + SESSION_PAGE_SIZE)}
        />
    )
}
