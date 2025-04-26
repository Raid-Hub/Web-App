import "server-only"

import { type AuthConfig } from "@auth/core/types"
import { type DestinyLinkedProfilesResponse } from "bungie-net-core/models"
import { updateBungieAccessTokens } from "./updateBungieAccessTokens"
import { updateDestinyProfiles } from "./updateDestinyProfiles"

export const signInCallback: Required<AuthConfig>["callbacks"]["signIn"] = async params => {
    if (params.account?.provider === "bungie" && params.profile) {
        await Promise.all([
            // Check if we have an adapter user (existing user) or a new user
            // If we have an adapter user, we need to update the access tokens
            "createdAt" in params.user &&
                params.user.createdAt.getTime() > 0 &&
                updateBungieAccessTokens({
                    userId: params.account.providerAccountId,
                    access: {
                        value: params.account.access_token!,
                        expires: new Date(params.account.expires_at! * 1000)
                    },
                    refresh: {
                        value: params.account.refresh_token!,
                        expires: new Date(Date.now() + params.account.refresh_expires_in! * 1000)
                    }
                }),
            updateDestinyProfiles(params.profile as unknown as DestinyLinkedProfilesResponse)
        ])
    }
    return true
}
