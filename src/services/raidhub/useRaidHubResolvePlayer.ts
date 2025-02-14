import { useQuery } from "@tanstack/react-query"
import { getRaidHubApi } from "~/services/raidhub/common"
import { type RaidHubPlayerInfo } from "./types"

export function useRaidHubResolvePlayer(
    membershipId: string,
    opts?: {
        initialData?: RaidHubPlayerInfo
        placeholderData?: RaidHubPlayerInfo
        enabled?: boolean
        staleTime?: number
    }
) {
    return useQuery({
        queryFn: ({ queryKey }) =>
            getRaidHubApi("/player/{membershipId}/basic", { membershipId: queryKey[3] }, null).then(
                res => res.response
            ),
        queryKey: ["raidhub", "player", "basic", membershipId] as const,
        staleTime: 1000 * 60 * 60,
        ...opts
    })
}
