import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { getProfile } from "bungie-net-core/endpoints/Destiny2"
import { type BungieMembershipType } from "bungie-net-core/models"
import { type DestinyProfileResponse } from "bungie-net-core/models/Destiny/Responses/DestinyProfileResponse"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

type UseProfileQueryData =
    | DestinyProfileResponse<[100, 200, 202]>
    | DestinyProfileResponse<[100, 200]>

const getUseProfileQueryKey = (destinyMembershipId: string, membershipType: BungieMembershipType) =>
    ["bungie", "profile", "primary", destinyMembershipId, membershipType] as const

export const useProfile = <T = UseProfileQueryData>(
    params: {
        destinyMembershipId: string
        membershipType: BungieMembershipType
    },
    opts?: Exclude<
        UseQueryOptions<UseProfileQueryData, Error, T, ReturnType<typeof getUseProfileQueryKey>>,
        "queryFn" | "queryKey" | "structuralSharing"
    >
) => {
    const bungieClient = useBungieClient()
    const isClient = typeof window !== "undefined"

    return useQuery<UseProfileQueryData, Error, T, ReturnType<typeof getUseProfileQueryKey>>({
        queryKey: getUseProfileQueryKey(params.destinyMembershipId, params.membershipType),
        queryFn: ({ queryKey }) =>
            getProfile(bungieClient, {
                destinyMembershipId: queryKey[3],
                membershipType: queryKey[4],
                components: [100 /*Profiles*/, 200 /*Characters*/, 202 /*CharacterProgressions*/]
            }).then(res => res.Response),
        structuralSharing: (old, current) => ({
            // Just in case we miss some components, we want to keep the old data.
            ...old,
            ...current
        }),
        ...opts,
        enabled: isClient && (opts?.enabled ?? true)
    })
}
