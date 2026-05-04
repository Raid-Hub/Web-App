import "server-only"

import type { AdapterUser } from "@auth/core/adapters"
import type { Account, User } from "@auth/core/types"
import { pushLinkedRoleMetadataForUser } from "~/lib/server/discord/pushLinkedRoleMetadata"

/**
 * After Discord is linked to a Bungie user, push application role connection metadata once
 * so linked roles can evaluate without waiting for a raid completion or manual Sync.
 */
export const authEvents = {
    async linkAccount(message: { user: User | AdapterUser; account: Account }) {
        if (message.account.provider !== "discord") {
            return
        }
        const bungieMembershipId = message.user.id
        if (typeof bungieMembershipId !== "string" || bungieMembershipId.length === 0) {
            return
        }
        const result = await pushLinkedRoleMetadataForUser(bungieMembershipId)
        if (!result.ok) {
            console.warn("[authEvents.linkAccount] pushLinkedRoleMetadataForUser", result)
        }
    }
}
