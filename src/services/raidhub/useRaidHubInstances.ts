import { useMutation } from "@tanstack/react-query"
import { useSession } from "~/hooks/app/useSession"
import { getRaidHubApi } from "./common"
import type { InstanceFinderQuery } from "./types"

async function getInstances({
    membershipId,
    bearerToken,
    query
}: {
    membershipId: string
    bearerToken?: string
    query: InstanceFinderQuery
}) {
    const authHeaders: HeadersInit = bearerToken
        ? {
              Authorization: `Bearer ${bearerToken}`
          }
        : {}

    const response = await getRaidHubApi(
        "/player/{membershipId}/instances",
        { membershipId },
        query,
        {
            headers: authHeaders
        }
    )
    return response.response
}

export const useInstances = () => {
    const { data } = useSession()
    const bearerToken = data?.raidHubAccessToken?.value

    return useMutation({
        mutationKey: ["raidhub", "instances"],
        mutationFn: ({
            destinyMembershipId,
            query
        }: {
            destinyMembershipId: string
            query: InstanceFinderQuery
        }) => getInstances({ membershipId: destinyMembershipId, bearerToken, query })
    })
}
