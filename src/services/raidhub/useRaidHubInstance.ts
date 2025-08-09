import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { type RaidHubInstanceExtended, type RaidHubPlayerInfo } from "~/services/raidhub/types"
import { getRaidHubApi } from "./common"

export const useRaidHubInstance = (
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
        queryKey: ["raidhub", "instance", activityId] as const,
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

export const useRaidHubInstanceList = (instanceIds: string[]) => {
    return useQueries({
        queries: instanceIds.map(id => ({
            queryKey: ["raidhub", "instance", id] as const,
            queryFn: () =>
                getRaidHubApi("/instance/{instanceId}", { instanceId: id }, null).then(
                    res => res.response
                ),
            staleTime: 3600_000
        }))
    })
}
