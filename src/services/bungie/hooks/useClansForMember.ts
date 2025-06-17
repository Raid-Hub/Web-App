import { useQuery } from "@tanstack/react-query"
import { getGroupsForMember } from "bungie-net-core/endpoints/GroupV2"
import type {
    BungieMembershipType,
    GetGroupsForMemberResponse,
    GroupsForMemberFilter
} from "bungie-net-core/models"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

export const useClansForMember = <T = GetGroupsForMemberResponse>(
    {
        filter = 0, // GroupsForMemberFilter.All
        ...params
    }: {
        membershipId: string
        membershipType: BungieMembershipType
        filter?: GroupsForMemberFilter // GroupsForMemberFilter.All
    },
    opts?: {
        staleTime?: number
        select?: (data: GetGroupsForMemberResponse) => T
    }
) => {
    const bungieClient = useBungieClient()

    return useQuery({
        queryKey: ["bungie", "clan for member", filter, params] as const,
        queryFn: ({ queryKey }) =>
            getGroupsForMember(bungieClient, {
                ...queryKey[3],
                filter: queryKey[2],
                groupType: 1 // GroupType.Clan
            }).then(res => res.Response),
        ...opts
    })
}
