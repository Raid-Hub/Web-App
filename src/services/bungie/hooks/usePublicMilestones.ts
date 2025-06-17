import { useQuery } from "@tanstack/react-query"
import { getPublicMilestones } from "bungie-net-core/endpoints/Destiny2"
import { type DestinyPublicMilestone } from "bungie-net-core/models"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

export const usePublicMilestones = <T = Record<number, DestinyPublicMilestone>>(opts?: {
    suspense?: boolean
    select?: (data: Record<number, DestinyPublicMilestone>) => T
    refetchInterval?: (data?: T) => number | false
    enabled?: boolean
}) => {
    const bungieClient = useBungieClient()

    return useQuery({
        queryKey: ["bungie", "public milestones"] as const,
        queryFn: () => getPublicMilestones(bungieClient).then(res => res.Response),
        ...opts
    })
}
