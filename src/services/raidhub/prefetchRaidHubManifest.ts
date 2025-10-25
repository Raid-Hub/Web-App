import { saferFetch } from "~/lib/server/saferFetch"
import { reactRequestDedupe } from "~/util/react-cache"
import { getRaidHubApi } from "./common"
import { type RaidHubManifestResponse } from "./types"

export const prefetchManifest = reactRequestDedupe(async (): Promise<RaidHubManifestResponse> => {
    return await getRaidHubApi(
        "/manifest",
        null,
        null,
        {
            next: { revalidate: 86400, tags: ["manifest"] }
        },
        saferFetch
    ).then(res => res.response)
})
