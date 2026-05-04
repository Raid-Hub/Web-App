import type { paths } from "./openapi"
import type { RaidHubPostPath } from "./types"

/** OpenAPI `paths` keys for BFF calls under ``/internal/*``. */
export type RaidHubInternalPath = Extract<keyof paths, `/internal${string}`>

/**
 * Typed route strings (per-key literals so ``postRaidHubApi`` infers request bodies).
 * Regenerate ``openapi.d.ts`` after API route changes; wrong strings fail at compile time
 * when used with ``getRaidHubApi`` / ``postRaidHubApi``.
 */
export const RAIDHUB_INTERNAL_PATHS = {
    queueDiscordLinkedRoleSync: "/internal/queue-discord-linked-role-sync",
    subscriptionsDiscordWebhooks: "/internal/subscriptions/discord/webhooks"
} as const

export type QueueDiscordLinkedRoleSyncRequestBody =
    paths["/internal/queue-discord-linked-role-sync"]["post"]["requestBody"]["content"]["application/json"]

export type DiscordSubscriptionWebhookPutBody =
    paths["/internal/subscriptions/discord/webhooks"]["put"]["requestBody"]["content"]["application/json"]

const _queueSyncPathIsPostable: RaidHubPostPath = RAIDHUB_INTERNAL_PATHS.queueDiscordLinkedRoleSync
void _queueSyncPathIsPostable
