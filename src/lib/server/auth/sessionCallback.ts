import "server-only"

import { type Adapter, type AdapterUser } from "@auth/core/adapters"
import { type AuthConfig } from "@auth/core/types"
import { refreshAuthorization } from "bungie-net-core/auth"
import { prisma } from "~/lib/server/prisma"
import ServerBungieClient from "~/services/bungie/ServerBungieClient"
import { postRaidHubApi } from "~/services/raidhub/common"
import { type AuthError, type BungieAccount } from "./types"
import { updateBungieAccessTokens } from "./updateBungieAccessTokens"

const bungieClient = new ServerBungieClient()

export const sessionCallback = (async ({
    session,
    user: { raidHubAccessToken, bungieAccount, ...user }
}: NonNullable<Awaited<ReturnType<Required<Adapter>["getSessionAndUser"]>>>) => {
    const [bungieToken, raidhubToken] = await Promise.all([
        refreshBungieAuth(bungieAccount, user.id),
        refreshRaidHubBearer({
            userId: user.id,
            token: raidHubAccessToken,
            role: user.role,
            profiles: user.profiles
        })
    ])

    return {
        user,
        primaryDestinyMembershipId: user.profiles.find(p => p.isPrimary)?.destinyMembershipId,
        bungieAccessToken: bungieToken.token,
        raidHubAccessToken: raidhubToken?.token ?? undefined,
        errors: Array.from(new Set([...(raidhubToken?.errors ?? []), ...bungieToken.errors])),
        expires: session.expires
    }
}) as unknown as Required<AuthConfig>["callbacks"]["session"]

async function refreshBungieAuth(bungie: BungieAccount, userId: string) {
    if (
        bungie.expiresAt &&
        bungie.accessToken &&
        Date.now() < (bungie.expiresAt - 300) * 1000 // give a 5 minute buffer where it's not expired but we should refresh
    ) {
        // If user access token has not expired yet
        return {
            token: {
                value: bungie.accessToken,
                expires: new Date(bungie.expiresAt * 1000).toISOString()
            },
            errors: []
        }
    } else if (
        bungie.refreshToken &&
        (!bungie.refreshExpiresAt || Date.now() < bungie.refreshExpiresAt * 1000)
    ) {
        // The refresh token is still valid

        const errors: AuthError[] = []

        const bungieTokens = await refreshAuthorization(
            bungie.refreshToken,
            {
                client_id: process.env.BUNGIE_CLIENT_ID!,
                client_secret: process.env.BUNGIE_CLIENT_SECRET!
            },
            bungieClient
        ).catch(e => {
            if (
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                e.response?.error_description === "SystemDisabled" ||
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                e.response?.error_description === "Error Response for Shard Relay."
            ) {
                errors.push("BungieAPIOffline")
            } else {
                console.error("Failed to refresh Bungie access token", e)
                errors.push("AccessTokenError")
            }
            return null
        })

        if (bungieTokens) {
            await updateBungieAccessTokens({
                userId,
                access: {
                    value: bungieTokens.access_token,
                    expires: new Date(Date.now() + bungieTokens.expires_in * 1000)
                },
                refresh: {
                    value: bungieTokens.refresh_token,
                    expires: new Date(Date.now() + bungieTokens.refresh_expires_in * 1000)
                }
            }).catch(e => {
                errors.push("PrismaError")
                console.error("Failed to update Bungie access token", e)
                return null
            })
        }

        return {
            token: bungieTokens
                ? {
                      value: bungieTokens.access_token,
                      expires: new Date(Date.now() + bungieTokens.expires_in * 1000).toISOString()
                  }
                : undefined,
            errors
        }
    } else {
        return {
            token: undefined,
            errors: ["ExpiredRefreshTokenError" as const]
        }
    }
}

async function refreshRaidHubBearer({
    userId,
    token,
    role,
    profiles
}: {
    userId: string
    token: {
        value: string
        expiresAt: Date
    } | null
    role: AdapterUser["role"]
    profiles: AdapterUser["profiles"]
}) {
    if (token && token.expiresAt.getTime() - 900_000 > Date.now()) {
        return {
            token: {
                value: token.value,
                expires: token.expiresAt.toISOString()
            },
            errors: []
        }
    }

    const errors: AuthError[] = []

    const newToken = await (
        role === "ADMIN"
            ? postRaidHubApi(
                  "/authorize/admin",
                  "post",
                  {
                      bungieMembershipId: userId,
                      adminClientSecret: process.env.RAIDHUB_ADMIN_CLIENT_SECRET!
                  },
                  null
              )
            : postRaidHubApi(
                  "/authorize/user",
                  "post",
                  {
                      bungieMembershipId: userId,
                      destinyMembershipIds: profiles.map(p => p.destinyMembershipId),
                      clientSecret: process.env.RAIDHUB_CLIENT_SECRET!
                  },
                  null
              )
    )
        .then(res => res.response)
        .catch(e => {
            errors.push("RaidHubAuthorizationError")
            console.error("Failed to refresh RaidHub auth token", e)
            return null
        })

    if (newToken) {
        await prisma.raidHubAccessToken
            .upsert({
                where: {
                    userId
                },
                create: {
                    userId,
                    value: newToken.value,
                    expiresAt: newToken.expires
                },
                update: {
                    value: newToken.value,
                    expiresAt: newToken.expires
                }
            })
            .catch(e => {
                errors.push("PrismaError")
                console.error("Failed to update RaidHub admin token", e)
            })
    }

    return {
        token: newToken ?? token,
        errors
    }
}
