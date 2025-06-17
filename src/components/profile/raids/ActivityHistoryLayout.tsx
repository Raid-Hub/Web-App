"use client"

import { type Collection } from "@discordjs/collection"
import { useState } from "react"
import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { Button } from "~/shad/button"
import { ActivityHistoryList } from "./ActivityHistoryList"

export const ActivityHistoryLayout = ({
    activities,
    isLoading
}: {
    activities: Collection<string, RaidHubInstanceForPlayer>
    isLoading: boolean
}) => {
    const [sections, setSections] = useState(20)

    return (
        <div className="flex w-full flex-col justify-start space-y-4">
            <ActivityHistoryList sections={sections} allActivities={activities} />
            <div className="w-full">
                <Button
                    disabled={isLoading}
                    onClick={() => !isLoading && setSections(old => old + 20)}>
                    Load More
                </Button>
            </div>
        </div>
    )
}
