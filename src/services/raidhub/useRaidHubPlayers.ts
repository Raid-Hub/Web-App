import { useQueries, useQuery } from "@tanstack/react-query"
import { useSession } from "~/hooks/app/useSession"
import { getRaidHubApi } from "~/services/raidhub/common"
import { type RaidHubPlayerProfileResponse } from "./types"

export function useRaidHubPlayers(
    membershipIds: string[],
    opts?: {
        enabled?: boolean
    }
) {
    const session = useSession()

    const authHeaders: HeadersInit = session.data?.raidHubAccessToken?.value
        ? {
              Authorization: `Bearer ${session.data.raidHubAccessToken.value}`
          }
        : {}

    const queries = useQueries({
        queries: membershipIds.map(membershipId => ({
            queryFn: () =>
                getRaidHubApi(
                    "/player/{membershipId}/profile",
                    { membershipId: membershipId },
                    null,
                    {
                        headers: authHeaders
                    }
                ).then(res => res.response),
            queryKey: ["raidhub", "player", membershipId] as const
        })),
        ...opts,
        ...(session.status === "loading" ? { enabled: false } : {})
    })

    const players = queries
        .map(q => q.data)
        .filter((data): data is RaidHubPlayerProfileResponse => !!data)
    const isLoading = queries.some(q => q.isLoading)

    return {
        refetch: () => queries.forEach(q => q.refetch()),
        players,
        isLoading,
        errors: queries.map(q => q.error)
    }
}

export const useRaidHubPlayer = (
    membershipId: string,
    opts?: {
        enabled?: boolean
    }
) => {
    const session = useSession()

    const authHeaders: HeadersInit = session.data?.raidHubAccessToken?.value
        ? {
              Authorization: `Bearer ${session.data.raidHubAccessToken.value}`
          }
        : {}

    return useQuery({
        queryFn: ({ queryKey }) =>
            getRaidHubApi("/player/{membershipId}/profile", { membershipId: queryKey[2] }, null, {
                headers: authHeaders
            }).then(res => res.response),
        queryKey: ["raidhub", "player", membershipId] as const,
        ...opts
    })
}
