import { getClanBannerSource } from "bungie-net-core/endpoints/Destiny2"
import { getGroup } from "bungie-net-core/endpoints/GroupV2"
import { notFound } from "next/navigation"
import { BungiePlatformError } from "~/models/BungieAPIError"
import ServerBungieClient from "~/services/bungie/ServerBungieClient"
import { reactRequestDedupe } from "~/util/react-cache"

export type PageProps = {
    params: {
        groupId: string
    }
}

const clanClient = new ServerBungieClient({
    next: { revalidate: 3600 }, // 1 hour
    timeout: 6000
})

const expectedErrorCodes = [1, 621, 622, 686]

export const getClan = reactRequestDedupe(async (groupId: string) =>
    getGroup(clanClient, { groupId })
        .then(res => {
            if (res.Response.detail.groupType != 1 || res.Response.detail.groupId === "4982805") {
                throw new BungiePlatformError(res, 200, `/GroupV2/GetGroup/${groupId}`)
            }
            return res.Response
        })
        .catch(err => {
            if (err instanceof BungiePlatformError && expectedErrorCodes.includes(err.ErrorCode)) {
                notFound()
            } else {
                return null
            }
        })
)

const bannerClient = new ServerBungieClient({
    next: { revalidate: false }, // never revalidate
    timeout: 4000
})

export const getClanBannerDefinitions = reactRequestDedupe(() =>
    getClanBannerSource(bannerClient).then(res => res.Response)
)
