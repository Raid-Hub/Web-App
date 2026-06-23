import { useQuery } from "@tanstack/react-query"
import { useSession } from "~/hooks/app/useSession"
import { getRaidHubApi } from "./common"

export const usePlayerStanding = (membershipId: string | null) => {
    const session = useSession()
    const accessToken = session.data?.raidHubAccessToken
    return useQuery({
        queryKey: ["raidhub", "player-standing", membershipId],
        queryFn: () =>
            getRaidHubApi(
                "/admin/reporting/player-standing/{membershipId}",
                {
                    membershipId: membershipId!
                },
                null,
                {
                    headers: accessToken
                        ? {
                              Authorization: `Bearer ${accessToken.value}`
                          }
                        : {}
                }
            ).then(res => res.response),
        enabled: !!membershipId
    })
}
