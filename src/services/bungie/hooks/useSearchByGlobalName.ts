import { useQuery } from "@tanstack/react-query"
import { searchByGlobalNamePost } from "bungie-net-core/endpoints/User"
import { type UserSearchResponse } from "bungie-net-core/models"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"
import { type BungiePlatformError } from "~/models/BungieAPIError"

export const useSearchByGlobalName = <T>(
    params: { displayNamePrefix: string; page?: number },
    opts?: {
        enabled?: boolean
        select?: (data: UserSearchResponse) => T
        cacheTime?: number
    }
) => {
    const bungieClient = useBungieClient()

    const page = params.page ?? 0

    return useQuery({
        queryKey: ["bungie", "player by prefix", params.displayNamePrefix, page] as const,
        queryFn: ({ queryKey }) =>
            searchByGlobalNamePost(
                bungieClient,
                {
                    page: queryKey[3]
                },
                {
                    displayNamePrefix: queryKey[2]
                }
            )
                .then(res => res.Response)
                .catch((error: BungiePlatformError): UserSearchResponse => {
                    // If the search returns no results `PlatformErrorCodes.UserCannotResolveCentralAccount`
                    // we should return an empty array instead of throwing an error
                    if (error.ErrorCode === 217) {
                        return {
                            hasMore: false,
                            page: queryKey[3],
                            searchResults: []
                        }
                    } else {
                        throw error
                    }
                }),
        ...opts
    })
}
