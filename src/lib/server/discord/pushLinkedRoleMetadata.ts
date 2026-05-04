import "server-only"

import { prisma } from "~/lib/server/prisma"
import { refreshDiscordAccountTokensIfNeeded } from "~/lib/server/auth/discordTokenRefresh"
import { postRaidHubApi } from "~/services/raidhub/common"
import { RAIDHUB_INTERNAL_PATHS } from "~/services/raidhub/internalPaths"
import { getRaidHubErrorEnvelopeMessage, RaidHubError } from "~/services/raidhub/RaidHubError"

export type PushLinkedRoleMetadataResult =
    | { ok: true }
    | {
          ok: false
          code:
              | "not_linked"
              | "missing_env"
              | "refresh_failed"
              | "no_profile"
              | "enqueue_failed"
          detail?: string
      }

/** Validates Discord link, loads all Destiny profiles in Prisma, refreshes OAuth, then enqueues sync via api.raidhub.io → Rabbit → Hermes. */
export async function pushLinkedRoleMetadataForUser(bungieMembershipId: string): Promise<PushLinkedRoleMetadataResult> {
    const apiUrl = process.env.RAIDHUB_API_URL?.trim()
    const clientSecret = process.env.RAIDHUB_CLIENT_SECRET?.trim()
    if (!apiUrl || !clientSecret) {
        return {
            ok: false,
            code: "missing_env",
            detail: "RAIDHUB_API_URL and RAIDHUB_CLIENT_SECRET (same value API uses as CLIENT_SECRET)"
        }
    }

    const discordRow = await prisma.account.findFirst({
        where: { userId: bungieMembershipId, provider: "discord" },
        select: { accessToken: true, scope: true }
    })
    if (!discordRow?.accessToken) {
        return { ok: false, code: "not_linked" }
    }
    if (!discordRow.scope?.includes("role_connections.write")) {
        return { ok: false, code: "not_linked", detail: "reconnect_discord" }
    }

    const profiles = await prisma.profile.findMany({
        where: { bungieMembershipId },
        select: { destinyMembershipId: true }
    })
    if (profiles.length === 0) {
        return { ok: false, code: "no_profile" }
    }
    const destinyMembershipIds = profiles.map(p => String(p.destinyMembershipId))

    const refreshed = await refreshDiscordAccountTokensIfNeeded(bungieMembershipId)
    if (!refreshed) {
        return { ok: false, code: "refresh_failed" }
    }

    try {
        await postRaidHubApi(
            RAIDHUB_INTERNAL_PATHS.queueDiscordLinkedRoleSync,
            "post",
            { destinyMembershipIds },
            null,
            undefined,
            { headers: { "x-raidhub-client-secret": clientSecret } }
        )
        return { ok: true }
    } catch (e) {
        if (e instanceof RaidHubError && e.errorCode === "ServiceUnavailableError") {
            return { ok: false, code: "enqueue_failed", detail: getRaidHubErrorEnvelopeMessage(e) }
        }
        return {
            ok: false,
            code: "enqueue_failed",
            detail: "request_failed"
        }
    }
}
