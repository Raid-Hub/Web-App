import { useQueries, type UseQueryOptions } from "@tanstack/react-query"
import { getMembersOfGroup } from "bungie-net-core/endpoints/GroupV2"
import { type SearchResultOfGroupMember } from "bungie-net-core/models"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

type QueryOptions<T> = UseQueryOptions<SearchResultOfGroupMember, Error, T>

export const useMembersOfGroup = <T = SearchResultOfGroupMember>(
    params: { groupId: string; pages: number },
    opts?: Omit<QueryOptions<T>, "queryKey" | "queryFn">
) => {
    const bungieClient = useBungieClient()

    return useQueries({
        queries: Array.from<unknown, QueryOptions<T>>({ length: params.pages }, (_, idx) => ({
            queryKey: ["bungie", "clan members", params.groupId, idx + 1] as const,
            queryFn: () =>
                getMembersOfGroup(bungieClient, {
                    groupId: params.groupId,
                    currentpage: idx + 1
                }).then(res => res.Response),
            ...opts
        }))
    })
}
