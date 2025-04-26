import { getLinkedProfiles } from "bungie-net-core/endpoints/Destiny2"
import { unstable_cache } from "next/cache"
import "server-only"
import { BungiePlatformError } from "~/models/BungieAPIError"

import { trpcServer } from "~/server/api/trpc/rpc"
import ServerBungieClient from "~/server/serverBungieClient"
import { getRaidHubApi } from "~/services/raidhub/common"
import { reactRequestDedupe } from "~/util/react-cache"

export const getUniqueProfileByVanity = reactRequestDedupe(
    unstable_cache(
        (vanity: string) =>
            trpcServer.profile.getUnique.query({ vanity }).catch(err => {
                console.error(err)
                return null
            }),
        ["profile-by-vanity"],
        {
            revalidate: 600,
            tags: ["vanity"]
        }
    )
)

export const getUniqueProfileByDestinyMembershipId = reactRequestDedupe(
    unstable_cache(
        (destinyMembershipId: string) =>
            trpcServer.profile.getUnique.query({ destinyMembershipId }).catch(err => {
                console.error(err)
                return null
            }),
        ["profile-by-destinymembershipid"],
        {
            revalidate: 600
        }
    )
)

// Get a player's profile from the RaidHub API
export const prefetchRaidHubPlayerProfileAuthenticated = reactRequestDedupe(
    (membershipId: string, bearerToken: string) =>
        getRaidHubApi(
            "/player/{membershipId}/profile",
            {
                membershipId: membershipId
            },
            null,
            {
                headers: {
                    Authorization: `Bearer ${bearerToken}`
                },
                cache: "no-store"
            }
        )
            .then(res => res.response)
            .catch(() => null)
)

export const prefetchRaidHubPlayerProfile = reactRequestDedupe((membershipId: string) =>
    getRaidHubApi(
        "/player/{membershipId}/profile",
        {
            membershipId: membershipId
        },
        null,
        {
            cache: "no-store"
        }
    )
        .then(res => res.response)
        .catch(() => null)
)

// Get a player's basic info from the RaidHub API (fast)
export const prefetchRaidHubPlayerBasic = reactRequestDedupe(async (membershipId: string) =>
    getRaidHubApi(
        "/player/{membershipId}/basic",
        {
            membershipId: membershipId
        },
        null,
        {
            next: {
                revalidate: 6 * 3600
            }
        }
    )
        .then(res => res.response)
        .catch(() => null)
)

const bungieClient = new ServerBungieClient({
    timeout: 5000
})

export const prefetchDestinyLinkedProfiles = reactRequestDedupe((membershipId: string) =>
    getLinkedProfiles(bungieClient, {
        membershipType: -1,
        membershipId: membershipId,
        getAllMemberships: true
    })
        .then(res => res.Response)
        .catch(e => {
            if (e instanceof BungiePlatformError) {
                return null
            } else {
                throw e
            }
        })
)
