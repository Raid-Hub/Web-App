import * as Sentry from "@sentry/nextjs"
import { RaidHubError } from "~/services/raidhub/RaidHubError"
import type { RaidHubErrorCode } from "~/services/raidhub/types"
import { buildSentryContext, type SentryCaptureContext } from "./context"
import { getSentryDsnForServer } from "./env"

/**
 * RaidHub API error codes we already handle in UI (404 player, private profile, etc.).
 * Skips duplicate Sentry noise from react-query/tRPC hooks — not a claim that these can never indicate bugs.
 */
const HANDLED_RAIDHUB_ERROR_CODES = new Set<RaidHubErrorCode>([
    "PlayerNotFoundError",
    "PlayerPrivateProfileError",
    "PlayerProtectedResourceError",
    "InstanceNotFoundError",
    "PGCRNotFoundError",
    "PlayerNotOnLeaderboardError",
    "PlayerNotInInstance",
    "RaidNotFoundError",
    "PantheonVersionNotFoundError",
    "InvalidActivityVersionComboError",
    "ClanNotFoundError",
    "InsufficientPermissionsError",
    "PathValidationError",
    "QueryValidationError",
    "BodyValidationError",
    "BungieServiceOffline"
])

/** tRPC codes mapped to handled HTTP semantics — same dedupe rationale as above. */
const HANDLED_TRPC_ERROR_CODES = new Set(["NOT_FOUND", "UNAUTHORIZED", "FORBIDDEN", "BAD_REQUEST"])

function shouldCaptureError(error: unknown): boolean {
    if (error instanceof RaidHubError && HANDLED_RAIDHUB_ERROR_CODES.has(error.errorCode)) {
        return false
    }

    if (error && typeof error === "object" && "data" in error) {
        const code = (error as { data?: { code?: string } }).data?.code
        if (code && HANDLED_TRPC_ERROR_CODES.has(code)) {
            return false
        }
    }

    return true
}

function normalizeContext(
    context?: SentryCaptureContext | Record<string, unknown>
): SentryCaptureContext | undefined {
    if (!context) {
        return undefined
    }

    if ("tags" in context || "extra" in context) {
        return context as SentryCaptureContext
    }

    return { extra: context }
}

export function captureClientException(
    error: unknown,
    context?: SentryCaptureContext | Record<string, unknown>
): void {
    if (!shouldCaptureError(error)) {
        return
    }

    const enriched = buildSentryContext(error, normalizeContext(context))
    Sentry.captureException(error, enriched)
}

export function captureServerException(error: unknown, context?: SentryCaptureContext): void {
    if (!getSentryDsnForServer() || !shouldCaptureError(error)) {
        return
    }

    const enriched = buildSentryContext(error, context)
    Sentry.captureException(error, enriched)
}
