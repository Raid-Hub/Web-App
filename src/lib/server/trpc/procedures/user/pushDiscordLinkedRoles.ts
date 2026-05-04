import { pushLinkedRoleMetadataForUser } from "~/lib/server/discord/pushLinkedRoleMetadata"
import { protectedProcedure } from "../.."

export const pushDiscordLinkedRoles = protectedProcedure.mutation(async ({ ctx }) => {
    const result = await pushLinkedRoleMetadataForUser(ctx.session.user.id)
    if (result.ok) {
        return { ok: true as const }
    }
    return { ok: false as const, code: result.code, detail: result.detail }
})
