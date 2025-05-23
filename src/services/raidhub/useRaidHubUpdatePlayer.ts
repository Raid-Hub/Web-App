import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { useSession } from "~/hooks/app/useSession"
import { postRaidHubApi } from "./common"
import { type CheatLevel } from "./types"

export const useRaidHubUpdatePlayer = (
    membershipId: string,
    opts?: UseMutationOptions<string, Error, { cheatLevel: CheatLevel }>
) => {
    const session = useSession()
    const headers = session.data?.raidHubAccessToken?.value
        ? {
              Authorization: `Bearer ${session.data?.raidHubAccessToken?.value}`
          }
        : undefined

    return useMutation<string, Error, { cheatLevel: CheatLevel }>({
        mutationKey: ["raidhub", "player", membershipId] as const,
        mutationFn: body =>
            postRaidHubApi(
                "/admin/reporting/player/{membershipId}",
                "patch",
                body,
                { membershipId },
                null,
                {
                    headers
                }
            ).then(res => res.response),
        ...opts
    })
}
