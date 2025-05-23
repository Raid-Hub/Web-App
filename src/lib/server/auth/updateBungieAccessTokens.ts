import "server-only"

import { prisma } from "../prisma"
import { type AuthToken } from "./types"

export async function updateBungieAccessTokens({
    userId,
    access,
    refresh
}: {
    userId: string
    access: AuthToken
    refresh: AuthToken
}) {
    await prisma.account.update({
        where: {
            uniqueProviderUser: {
                provider: "bungie",
                userId: userId
            }
        },
        data: {
            accessToken: access.value,
            expiresAt: access.expires.getTime() / 1000,
            refreshToken: refresh.value,
            refreshExpiresAt: refresh.expires.getTime() / 1000
        }
    })
}
