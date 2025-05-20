import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getRaidHubApi } from "./common"

export const useRaidHubPGCR = (
    instanceId: string,
    opts?: {
        enabled: boolean
    }
) => {
    const queryClient = useQueryClient()
    return useQuery({
        queryKey: ["raidhub", "pgcr", instanceId] as const,
        queryFn: ({ queryKey }) =>
            getRaidHubApi("/pgcr/{instanceId}", { instanceId: queryKey[2] }, null),
        staleTime: 3600_000,
        onSuccess: data => {
            queryClient.setQueryData(["bungie", "pgcr", instanceId], data)
        },
        ...opts
    })
}
