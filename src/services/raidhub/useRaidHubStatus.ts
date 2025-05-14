import { useQuery } from "@tanstack/react-query"
import { getRaidHubApi } from "./common"
import { type RaidHubStatusResponse } from "./types"

export const useRaidHubStatus = () =>
    useQuery<RaidHubStatusResponse, Error>({
        queryKey: ["raidhub", "status"],
        queryFn: () => getRaidHubApi("/status", null, null).then(res => res.response),
        staleTime: 10000,
        refetchOnReconnect: true,
        refetchOnMount: true,
        refetchIntervalInBackground: false,
        retry: 3,
        refetchInterval: data => {
            if (!data) return 30_000

            const getAtlasInterval = () => {
                switch (data.AtlasPGCR.status) {
                    case "Crawling":
                        if (
                            data.AtlasPGCR.medianSecondsBehindNow &&
                            data.AtlasPGCR.medianSecondsBehindNow > 60
                        ) {
                            return 30_000
                        }
                        return 120_000
                    case "Idle":
                        return 300_000
                    case "Offline":
                        return 45_000
                    default:
                        return 60_000
                }
            }

            const getFloodgatesInterval = () => {
                switch (data.FloodgatesPGCR.status) {
                    case "Blocked":
                        return 20_000
                    case "Crawling":
                        return 15_000
                    case "Live":
                        return 60_000
                    case "Empty":
                        return 600_000
                }
            }

            return Math.min(getAtlasInterval(), getFloodgatesInterval())
        }
    })
