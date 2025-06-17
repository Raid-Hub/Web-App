import { useQuery } from "@tanstack/react-query"
import { getPostGameCarnageReport } from "bungie-net-core/endpoints/Destiny2"
import type { DestinyPostGameCarnageReportData } from "bungie-net-core/models"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

export const usePostGameCarnageReport = <T = DestinyPostGameCarnageReportData>(
    params: { activityId: string },
    opts?: {
        staleTime?: number
        select?: (data: DestinyPostGameCarnageReportData) => T
        enabled?: boolean
    }
) => {
    const bungieClient = useBungieClient()

    return useQuery({
        queryKey: ["bungie", "pgcr", params.activityId] as const,
        queryFn: ({ queryKey }) =>
            getPostGameCarnageReport(bungieClient, {
                activityId: queryKey[2]
            }).then(res => res.Response),
        ...opts
    })
}
