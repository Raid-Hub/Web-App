import { useQuery } from "@tanstack/react-query"
import { RaidHubError } from "./RaidHubError"
import { getRaidHubApi } from "./common"

export const useClanStats = (
    groupId: string,
    opts?: {
        staleTime: number
        refetchOnWindowFocus: boolean
    }
) => {
    return useQuery({
        queryKey: ["raidhub", "clan", groupId],
        queryFn: ({ queryKey }) =>
            getRaidHubApi(
                "/clan/{groupId}",
                {
                    groupId: queryKey[2]
                },
                null
            ).then(res => res.response),
        retry: (failureCount, error) =>
            failureCount < 2 &&
            error instanceof RaidHubError &&
            (error.errorCode === "InternalServerError" ||
                error.errorCode === "ServiceUnavailableError"),
        retryDelay: failureCount => Math.min(2 ** failureCount * 1000, 8000),
        ...opts
    })
}
