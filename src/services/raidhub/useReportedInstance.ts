import { useQuery } from "@tanstack/react-query"
import { useSession } from "~/hooks/app/useSession"
import { getRaidHubApi } from "./common"

export const useReportedInstance = (instanceId: string) => {
    const session = useSession()
    const accessToken = session.data?.raidHubAccessToken
    return useQuery({
        queryKey: ["raidhub", "reports", instanceId],
        queryFn: () =>
            getRaidHubApi(
                "/admin/reporting/standing/{instanceId}",
                {
                    instanceId
                },
                null,
                {
                    headers: accessToken
                        ? {
                              Authorization: `Bearer ${accessToken.value}`
                          }
                        : {}
                }
            ).then(res => res.response)
    })
}
