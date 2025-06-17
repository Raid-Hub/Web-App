import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { getProfile } from "bungie-net-core/endpoints/Destiny2"
import type { BungieMembershipType } from "bungie-net-core/models"
import type { DestinyProfileResponse } from "bungie-net-core/models/Destiny/Responses/DestinyProfileResponse"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

export const useProfileTransitory = <T = DestinyProfileResponse<[1000]>>(
    params: {
        destinyMembershipId: string
        membershipType: BungieMembershipType
    },
    opts?: UseQueryOptions<DestinyProfileResponse<[1000]>, Error, T>
) => {
    const bungieClient = useBungieClient()

    return useQuery<DestinyProfileResponse<[1000]>, Error, T>({
        queryKey: ["bungie", "profile", "transitory", params],
        queryFn: () =>
            getProfile(bungieClient, {
                ...params,
                components: [1000]
            }).then(res => res.Response),
        ...opts
    })
}
