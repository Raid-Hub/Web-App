import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { getGlobalAlerts } from "bungie-net-core/endpoints/Core"
import { type GlobalAlert } from "bungie-net-core/models"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

type GetGlobalAlertsParams = { includestreaming?: boolean }

export const useGlobalAlerts = <T = GlobalAlert[]>(
    params: GetGlobalAlertsParams,
    opts?: Omit<
        UseQueryOptions<
            GlobalAlert[],
            Error,
            T,
            ["bungie", "global-alerts", GetGlobalAlertsParams]
        >,
        "queryKey" | "queryFn"
    >
) => {
    const bungieClient = useBungieClient()

    return useQuery({
        queryKey: ["bungie", "global-alerts", params] as const,
        queryFn: ({ queryKey }) =>
            getGlobalAlerts(bungieClient, queryKey[2]).then(res => res.Response),
        ...opts
    })
}
