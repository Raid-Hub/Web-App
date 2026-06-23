import { useMutation } from "@tanstack/react-query"
import { useSession } from "~/hooks/app/useSession"
import { RaidHubError } from "./RaidHubError"
import { getRaidHubApi } from "./common"
import type { InstanceFinderQuery } from "./types"

const RETRIABLE_RAIDHUB_ERROR_CODES = new Set(["InternalServerError", "ServiceUnavailableError"])

export { RETRIABLE_RAIDHUB_ERROR_CODES }

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
        mutationFn: async ({
            destinyMembershipId,
            query
        }: {
            destinyMembershipId: string
            query: InstanceFinderQuery
        }) => {
            let lastError: unknown

            for (let attempt = 0; attempt < 3; attempt++) {
                try {
                    return await getInstances({
                        membershipId: destinyMembershipId,
                        bearerToken,
                        query
                    })
                } catch (error) {
                    lastError = error

                    if (
                        !(
                            error instanceof RaidHubError &&
                            RETRIABLE_RAIDHUB_ERROR_CODES.has(error.errorCode)
                        ) ||
                        attempt === 2
                    ) {
                        throw error
                    }

                    await new Promise(resolve =>
                        setTimeout(resolve, Math.min(2 ** attempt * 1000, 8000))
                    )
                }
            }

            throw lastError
        }
    })
}
