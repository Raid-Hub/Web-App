"use client"

import { type Collection } from "@discordjs/collection"
import { useState } from "react"
import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { ActivityHistoryView } from "./history/ActivityHistoryView"

const INITIAL_SESSION_COUNT = 20
const SESSION_PAGE_SIZE = 20

export const ActivityHistoryLayout = ({
    activities,
    isLoading,
    profileMembershipIds
}: {
    activities: Collection<string, RaidHubInstanceForPlayer>
    isLoading: boolean
    profileMembershipIds: readonly string[]
}) => {
    const [visibleSessions, setVisibleSessions] = useState(INITIAL_SESSION_COUNT)

    return (
        <ActivityHistoryView
            activities={activities}
            visibleSessionCount={visibleSessions}
            isLoading={isLoading}
            profileMembershipIds={profileMembershipIds}
            onLoadMore={() => setVisibleSessions(count => count + SESSION_PAGE_SIZE)}
        />
    )
}
