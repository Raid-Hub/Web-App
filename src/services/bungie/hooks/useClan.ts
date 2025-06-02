import { useQuery } from "@tanstack/react-query"
import { getGroup } from "bungie-net-core/endpoints/GroupV2"
import { type GroupResponse } from "bungie-net-core/models"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

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
        queryFn: ({ queryKey }) =>
            getGroup(bungieClient, queryKey[2]).then(res => {
                if (res.Response.detail.groupType != 1) {
                    throw new Error("Not a clan")
                }
                return res.Response
            }),
        ...opts
    })
}
