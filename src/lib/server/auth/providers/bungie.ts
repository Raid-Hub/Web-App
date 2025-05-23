import { type TokenSet } from "@auth/core/types"
import { type BungieFetchConfig } from "bungie-net-core"
import { getLinkedProfiles } from "bungie-net-core/endpoints/Destiny2"
import type { DestinyLinkedProfilesResponse } from "bungie-net-core/models"
import { type OAuth2Config } from "next-auth/providers"
import ServerBungieClient from "~/services/bungie/ServerBungieClient"
import { type BungieUser } from "../types"

export default function BungieProvider(creds: {
    apiKey: string
    clientId: string
    clientSecret: string
}): OAuth2Config<DestinyLinkedProfilesResponse> {
    return {
        id: "bungie",
        name: "Bungie",
        type: "oauth",
        checks: ["state"],
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
        authorization: {
            url: "https://www.bungie.net/en/OAuth/Authorize",
            params: { scope: "" }
        },
        token: "https://www.bungie.net/platform/app/oauth/token/",
        userinfo: {
            url: "foo://bar",
            async request({ tokens }: { tokens: TokenSet }) {
                const res = await getLinkedProfiles(new AuthBungieClient(tokens.access_token!), {
                    membershipType: 254,
                    membershipId: tokens.membership_id as string
                })
                return res.Response
            }
        },
        profile(data): BungieUser {
            return {
                /**
                 * The `id` returned here is overriden prior to the `createUser` function in the adapter.
                 * However, it is used as the `providerAccountId` to create an account.
                 */
                id: data.bnetMembership.membershipId,
                name: data.bnetMembership.displayName,
                image: `https://www.bungie.net${
                    data.bnetMembership.iconPath.startsWith("/") ? "" : "/"
                }${data.bnetMembership.iconPath}`,
                userMembershipData: data
            }
        }
    }
}

class AuthBungieClient extends ServerBungieClient {
    private authToken: string
    constructor(authToken: string) {
        super()
        this.authToken = authToken
    }

    generatePayload(config: BungieFetchConfig): RequestInit & { headers: Headers } {
        const payload = super.generatePayload(config)
        payload.headers.set("Authorization", `Bearer ${this.authToken}`)
        return payload
    }
}
