import { useCallback } from "react"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"

export const useIsFeatureableRaidMilestone = () => {
    const { activeRaids, milestoneHashes } = useRaidHubManifest()

    return useCallback(
        (hash: string) => {
            const definition = milestoneHashes.get(Number(hash))
            // Filter out the current newest raid
            return definition && definition.id !== activeRaids[0]
        },
        [activeRaids, milestoneHashes]
    )
}
