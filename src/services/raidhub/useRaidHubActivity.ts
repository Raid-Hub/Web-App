import { useQuery, useQueryClient } from "@tanstack/react-query"
import { type RaidHubInstanceExtended, type RaidHubPlayerInfo } from "~/services/raidhub/types"
import { getRaidHubApi } from "./common"

export const useRaidHubActivity = (
    activityId: string,
    opts?: {
        enabled?: boolean
        initialData?: RaidHubInstanceExtended
        suspense?: boolean
        staleTime?: number
        placeholderData?: RaidHubInstanceExtended
    }
) => {
    const queryClient = useQueryClient()
    return useQuery({
        queryKey: ["raidhub", "activity", activityId] as const,
        queryFn: ({ queryKey }) =>
            getRaidHubApi("/instance/{instanceId}", { instanceId: queryKey[2] }, null).then(
                res => res.response
            ),
        staleTime: 3600_000,
        onSuccess: data => {
            data.players.forEach(entry => {
                queryClient.setQueryData<RaidHubPlayerInfo>(
                    ["raidhub", "player", "basic", entry.playerInfo.membershipId],
                    old => old ?? entry.playerInfo
                )
            })
        },
        ...opts
    })
}
