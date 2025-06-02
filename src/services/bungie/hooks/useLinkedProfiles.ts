import { useQuery } from "@tanstack/react-query"
import { getLinkedProfiles } from "bungie-net-core/endpoints/Destiny2"
import { type DestinyLinkedProfilesResponse } from "bungie-net-core/models"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

export const useLinkedProfiles = <T = DestinyLinkedProfilesResponse>(
    params: { membershipId: string },
    opts?: {
        select: (data: DestinyLinkedProfilesResponse) => T
        onSuccess?: (data: T) => void
    }
) => {
    const bungieClient = useBungieClient()

    return useQuery({
        queryKey: ["bungie", "linked profiles", params] as const,
        queryFn: ({ queryKey }) =>
            getLinkedProfiles(bungieClient, {
                getAllMemberships: true,
                membershipId: queryKey[2].membershipId,
                membershipType: -1 // all
            }).then(res => res.Response),
        staleTime: 1000 * 60 * 24, // 1 hour
        ...opts
    })
}
