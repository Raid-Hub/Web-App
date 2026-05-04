import { sanitizeLinkedRoleSyncErrorCode } from "~/lib/server/discord/linkedRoleSyncError"
import { protectedProcedure } from "../.."

type SyncHealth = "not_linked" | "needs_scope" | "needs_reconnect" | "pending" | "ok" | "error"

function deriveSyncHealth(input: {
    linked: boolean
    roleConnectionsScopeGranted: boolean
    lastSyncedAt: string | null
    lastError: string | null
}): SyncHealth {
    if (!input.linked) {
        return "not_linked"
    }
    if (!input.roleConnectionsScopeGranted) {
        return "needs_scope"
    }
    if (input.lastError === "http_401" || input.lastError === "http_403") {
        return "needs_reconnect"
    }
    if (input.lastError) {
        return "error"
    }
    if (!input.lastSyncedAt) {
        return "pending"
    }
    return "ok"
}

export const discordLinkedRolesStatus = protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const row = await ctx.prisma.account.findFirst({
        where: { userId, provider: "discord" },
        select: {
            displayName: true,
            scope: true,
            discordRoleMetadataSyncedAt: true,
            discordRoleMetadataSyncError: true
        }
    })

    if (!row) {
        return {
            linked: false as const,
            discordUsername: null,
            roleConnectionsScopeGranted: false,
            lastSyncedAt: null,
            lastError: null,
            syncHealth: "not_linked" as const
        }
    }

    const roleConnectionsScopeGranted = row.scope?.includes("role_connections.write") ?? false
    const lastSyncedAt = row.discordRoleMetadataSyncedAt?.toISOString() ?? null
    const lastError = sanitizeLinkedRoleSyncErrorCode(row.discordRoleMetadataSyncError)

    return {
        linked: true as const,
        discordUsername: row.displayName,
        roleConnectionsScopeGranted,
        lastSyncedAt,
        lastError,
        syncHealth: deriveSyncHealth({
            linked: true,
            roleConnectionsScopeGranted,
            lastSyncedAt,
            lastError
        })
    }
})
