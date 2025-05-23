import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { useSession } from "~/hooks/app/useSession"
import { postRaidHubApi } from "./common"
import { type RaidHubBlacklistBody } from "./types"

export const useRaidHubBlacklist = (
    instanceId: string,
    opts?: UseMutationOptions<boolean, Error, RaidHubBlacklistBody>
) => {
    const session = useSession()
    const headers = session.data?.raidHubAccessToken?.value
        ? {
              Authorization: `Bearer ${session.data?.raidHubAccessToken?.value}`
          }
        : undefined

    return useMutation<boolean, Error, RaidHubBlacklistBody>({
        mutationKey: ["raidhub", "blacklist", instanceId] as const,
        mutationFn: body =>
            postRaidHubApi(
                "/admin/reporting/blacklist/{instanceId}",
                "put",
                body,
                { instanceId },
                null,
                {
                    headers
                }
            ).then(res => res.response.blacklisted),
        ...opts
    })
}
