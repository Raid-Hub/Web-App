import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { getCommonSettings } from "bungie-net-core/endpoints/Core"
import { type CoreSettingsConfiguration } from "bungie-net-core/models"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

export const useCommonSettings = <T = CoreSettingsConfiguration>(
    opts?: Omit<
        UseQueryOptions<CoreSettingsConfiguration, Error, T, ["bungie", "platform-settings"]>,
        "queryKey" | "queryFn"
    >
) => {
    const bungieClient = useBungieClient()

    return useQuery({
        queryKey: ["bungie", "platform-settings"] as const,
        queryFn: () => getCommonSettings(bungieClient).then(res => res.Response),
        ...opts
    })
}
