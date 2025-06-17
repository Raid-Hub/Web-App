import { Collection } from "@discordjs/collection"
import { useMemo } from "react"
import { type RaidHubInstance } from "~/services/raidhub/types"

export const useActivitiesByPartition = <T extends RaidHubInstance>(
    allResults: Collection<string, T>,
    secondsBetweenPartitions: number
) => {
    return useMemo(() => {
        const msBetweenPartitions = secondsBetweenPartitions * 1000
        const partioned = new Collection<string, Collection<string, T>>()

        let previousDateCompleted: Date | null = null
        let currentKey = ""
        for (const activity of Array.from(allResults.values())) {
            const dateCompleted = new Date(activity.dateCompleted)
            if (dateCompleted.getTime() > Date.now()) {
                continue
            }
            if (
                previousDateCompleted &&
                previousDateCompleted.getTime() - dateCompleted.getTime() < msBetweenPartitions &&
                previousDateCompleted.getDate() === dateCompleted.getDate()
            ) {
                // Add to the previous key
                partioned.get(currentKey)!.set(activity.instanceId, activity)
            } else {
                // Create a new key
                previousDateCompleted = dateCompleted
                currentKey = dateCompleted.toISOString()
                partioned.set(currentKey, new Collection([[activity.instanceId, activity]]))
            }
        }
        return partioned
    }, [allResults, secondsBetweenPartitions])
}
