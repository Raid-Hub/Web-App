import { useQuery } from "@tanstack/react-query"
import { searchDestinyPlayerByBungieName } from "bungie-net-core/endpoints/Destiny2"
import { type UserInfoCard } from "bungie-net-core/models"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

export const useDestinyPlayerByBungieName = <T = UserInfoCard[]>(
    params: {
        displayName: string
        displayNameCode: number
    },
    opts?: {
        enabled?: boolean
        select?: (data: UserInfoCard[]) => T
        cacheTime?: number
    }
) => {
    const bungieClient = useBungieClient()

    return useQuery({
        queryKey: ["bungie", "player by bungie name", params] as const,
        queryFn: ({ queryKey }) =>
            searchDestinyPlayerByBungieName(
                bungieClient,
                {
                    membershipType: -1
                },
                queryKey[2]
            ).then(res => res.Response),
        ...opts
    })
}
