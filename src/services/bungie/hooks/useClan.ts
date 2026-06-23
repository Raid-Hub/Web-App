import { useQuery } from "@tanstack/react-query"
import { getGroup } from "bungie-net-core/endpoints/GroupV2"
import { type GroupResponse } from "bungie-net-core/models"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"
import { isValidClanGroupId } from "~/util/destiny/routeParams"

function isRetriableClanFetchError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false
    }

    return (
        error.message.includes("Content-Length header of network response exceeds response Body") ||
        error.message === "Failed to fetch" ||
        error.message === "Load failed" ||
        error.message.includes("NetworkError")
    )
}

export const useClan = (
    params: { groupId: string },
    opts?: {
        staleTime?: number
        initialData?: GroupResponse
        suspense?: boolean
    }
) => {
    const bungieClient = useBungieClient()

    return useQuery({
        queryKey: ["bungie", "clan", params] as const,
        enabled: isValidClanGroupId(params.groupId),
        queryFn: ({ queryKey }) =>
            getGroup(bungieClient, queryKey[2]).then(res => {
                if (res.Response.detail.groupType != 1) {
                    throw new Error("Not a clan")
                }
                return res.Response
            }),
        retry: (failureCount, error) => failureCount < 3 && isRetriableClanFetchError(error),
        retryDelay: failureCount => Math.min(2 ** failureCount * 1000, 8000),
        ...opts
    })
}
