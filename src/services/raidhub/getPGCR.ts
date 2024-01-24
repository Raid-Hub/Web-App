import { RaidHubAPIResponse } from "~/types/raidhub-api"
import { getRaidHubBaseUrl } from "~/util/raidhub/getRaidHubUrl"
import { createHeaders } from "./_createHeaders"
import { DestinyPostGameCarnageReportData } from "bungie-net-core/models"

export function activityQueryKey(instanceId: string) {
    return ["raidhub-pgcr", instanceId] as const
}
export async function getRaidHubPGCR(instanceId: string) {
    const url = new URL(getRaidHubBaseUrl() + `/pgcr/${instanceId}`)

    const res = await fetch(url, { headers: createHeaders() })

    const data = (await res.json()) as RaidHubAPIResponse<DestinyPostGameCarnageReportData>

    if (data.success) {
        return data.response
    } else {
        const err = new Error(data.message)
        Object.assign(err, data.error)
        throw err
    }
}
