import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { getProfile } from "bungie-net-core/endpoints/Destiny2"
import { type BungieMembershipType } from "bungie-net-core/models"
import { type DestinyProfileResponse } from "bungie-net-core/models/Destiny/Responses/DestinyProfileResponse"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

type UseLiveProfileQueryData = DestinyProfileResponse<[204, 205, 305]>

const getUseProfileQueryKey = (destinyMembershipId: string, membershipType: BungieMembershipType) =>
    ["bungie", "profile", "live data", destinyMembershipId, membershipType] as const

export const useProfileLiveData = <T = UseLiveProfileQueryData>(
    params: {
        destinyMembershipId: string
        membershipType: BungieMembershipType
    },
    opts?: Exclude<
        UseQueryOptions<
            UseLiveProfileQueryData,
            Error,
            T,
            ReturnType<typeof getUseProfileQueryKey>
        >,
        "queryFn" | "queryKey" | "structuralSharing"
    >
) => {
    const bungieClient = useBungieClient()
    const isClient = typeof window !== "undefined"

    return useQuery<UseLiveProfileQueryData, Error, T, ReturnType<typeof getUseProfileQueryKey>>({
        queryKey: getUseProfileQueryKey(params.destinyMembershipId, params.membershipType),
        queryFn: ({ queryKey }) =>
            getProfile(bungieClient, {
                destinyMembershipId: queryKey[3],
                membershipType: queryKey[4],
                components: [
                    204 /*CharacterActivities*/, 205 /*CharacterEquipment*/, 305 /*ItemSockets*/
                ]
            }).then(res => res.Response),
        ...opts,
        enabled: isClient && (opts?.enabled ?? true)
    })
}
