import { saferFetch } from "~/lib/server/saferFetch"
import { reactRequestDedupe } from "~/util/react-cache"
import { getRaidHubApi } from "./common"
import { type RaidHubManifestResponse } from "./types"

const localFallbackManifest: RaidHubManifestResponse = {
    hashes: {},
    activityDefinitions: {},
    versionDefinitions: {},
    listedRaidIds: [],
    sunsetRaidIds: [],
    prestigeRaidIds: [],
    masterRaidIds: [],
    contestRaidIds: [],
    resprisedRaidIds: [],
    resprisedChallengeVersionIds: [],
    pantheonIds: [],
    versionsForActivity: {},
    rankingTiers: [],
    feats: [],
    splashUrls: {}
}

export const prefetchManifest = reactRequestDedupe(async (): Promise<RaidHubManifestResponse> => {
    if (process.env.APP_ENV === "local" && !process.env.RAIDHUB_API_KEY) {
        return localFallbackManifest
    }

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
