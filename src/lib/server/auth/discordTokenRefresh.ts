import "server-only"

import { prisma } from "~/lib/server/prisma"
import { saferFetch } from "~/lib/server/saferFetch"

type DiscordTokenResponse = {
    access_token: string
    refresh_token?: string
    expires_in: number
    scope?: string
    token_type?: string
}

const refreshInflight = new Map<string, Promise<boolean>>()

function needsAccessRefresh(
    expiresAt: number | null,
    accessToken: string | null,
    nowSec: number,
    skewSec: number
): boolean {
    if (!accessToken) return true
    if (expiresAt == null) return true
    return expiresAt - skewSec <= nowSec
}

async function runRefreshDiscordAccountTokensIfNeeded(
    bungieMembershipId: string
): Promise<boolean> {
    const account = await prisma.account.findFirst({
        where: { userId: bungieMembershipId, provider: "discord" },
        select: {
            refreshToken: true,
            accessToken: true,
            expiresAt: true
        }
    })
    if (!account) {
        return true
    }

    const nowSec = Math.floor(Date.now() / 1000)
    const skew = 300

    if (!needsAccessRefresh(account.expiresAt, account.accessToken, nowSec, skew)) {
        return true
    }

    if (!account.refreshToken) {
        return false
    }

    const clientId = process.env.DISCORD_CLIENT_ID
    const clientSecret = process.env.DISCORD_CLIENT_SECRET
    if (!clientId || !clientSecret) {
        return false
    }

    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: account.refreshToken
    })

    const res = await saferFetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
    })

    const raw = (await res.json()) as DiscordTokenResponse & {
        error?: string
        error_description?: string
    }
    if (!res.ok) {
        const code = typeof raw.error === "string" ? raw.error : "unknown"
        console.warn("[DISCORD_TOKEN_REFRESH_HTTP_ERROR]", { status: res.status, error_code: code })
        return false
    }

    const expiresAt = Math.floor(Date.now() / 1000) + (raw.expires_in ?? 604800)

    try {
        await prisma.account.updateMany({
            where: { userId: bungieMembershipId, provider: "discord" },
            data: {
                accessToken: raw.access_token,
                refreshToken: raw.refresh_token ?? account.refreshToken,
                expiresAt,
                scope: raw.scope ?? undefined,
                tokenType: raw.token_type ?? "bearer"
            }
        })
    } catch (e) {
        console.error(
            "[DISCORD_TOKEN_REFRESH_PERSIST_FAILED]",
            e instanceof Error ? e.message : String(e)
        )
        return false
    }
    return true
}

/** Refreshes the Discord OAuth row for this Bungie user when near expiry. Returns false if a refresh was required but could not be completed. */
export async function refreshDiscordAccountTokensIfNeeded(
    bungieMembershipId: string
): Promise<boolean> {
    const existing = refreshInflight.get(bungieMembershipId)
    if (existing) {
        return existing
    }
    const p = runRefreshDiscordAccountTokensIfNeeded(bungieMembershipId).finally(() => {
        refreshInflight.delete(bungieMembershipId)
    })
    refreshInflight.set(bungieMembershipId, p)
    return p
}
