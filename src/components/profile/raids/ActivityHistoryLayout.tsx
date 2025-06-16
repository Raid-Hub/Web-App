"use client"

import { type Collection } from "@discordjs/collection"
import { useState } from "react"
import { Flex } from "~/components/__deprecated__/layout/Flex"
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
        <Flex $direction="column" $fullWidth $crossAxis="flex-start" $padding={0}>
            <ActivityHistoryList sections={sections} allActivities={activities} />
            <Flex $fullWidth $padding={1}>
                <Button
                    disabled={isLoading}
                    onClick={() => !isLoading && setSections(old => old + 20)}
                    style={{
                        padding: "1rem",
                        cursor: "pointer",
                        color: isLoading ? "gray" : undefined
                    }}>
                    Load More
                </Button>
            </Flex>
        </Flex>
    )
}
