import { RaidHubAPIResponse, RaidHubPlayerResponse } from "~/types/raidhub-api"
import { getRaidHubBaseUrl } from "~/util/raidhub/getRaidHubUrl"

export function playerQueryKey(membershipId: string) {
    return ["raidhub-player", membershipId] as const
}
export async function getPlayer(membershipId: string) {
    const url = new URL(getRaidHubBaseUrl() + `/player/${membershipId}`)

    const res = await fetch(url)

    const data = (await res.json()) as RaidHubAPIResponse<RaidHubPlayerResponse>
    if (data.success) {
        return data.response
    } else {
        throw new Error(data.message)
    }
}