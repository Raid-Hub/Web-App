import { useQuery } from "@tanstack/react-query"
import { getMembershipDataForCurrentUser } from "bungie-net-core/endpoints/User"
import { type UserMembershipData } from "bungie-net-core/models"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

export const useMembershipDataForCurrentUser = <T = UserMembershipData>(opts?: {
    select: (data: UserMembershipData) => T
    onSuccess?: (data: T) => void
}) => {
    const bungieClient = useBungieClient()

    return useQuery({
        queryKey: ["bungie", "linked profiles", bungieClient.getToken()] as const,
        queryFn: () => getMembershipDataForCurrentUser(bungieClient).then(res => res.Response),
        staleTime: 1000 * 60 * 24, // 1 hour
        ...opts
    })
}
