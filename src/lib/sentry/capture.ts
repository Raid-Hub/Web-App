import * as Sentry from "@sentry/nextjs"
import { RaidHubError } from "~/services/raidhub/RaidHubError"
import type { RaidHubErrorCode } from "~/services/raidhub/types"
import { getSentryDsnForServer } from "./env"

/** Expected API outcomes — surfaced in UI, not bugs. */
const EXPECTED_RAIDHUB_ERROR_CODES = new Set<RaidHubErrorCode>([
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
    "BungieServiceOffline",
    "ApiKeyError"
])

const EXPECTED_TRPC_ERROR_CODES = new Set(["NOT_FOUND", "UNAUTHORIZED", "FORBIDDEN", "BAD_REQUEST"])

function isAbortError(error: unknown): boolean {
    if (error instanceof DOMException && error.name === "AbortError") {
        return true
    }

    return error instanceof Error && error.name === "AbortError"
}

/** CDN/API blips and offline clients — not application bugs. */
function isTransientNetworkError(error: unknown): boolean {
    if (error instanceof DOMException && error.name === "NetworkError") {
        return true
    }

    if (error instanceof TypeError) {
        const { message } = error
        return (
            message === "Failed to fetch" ||
            message.startsWith("Load failed") ||
            message.startsWith("NetworkError when attempting to fetch resource")
        )
    }

    if (error instanceof Error && error.name === "TRPCClientError") {
        const { message } = error
        return message === "Failed to fetch" || message === "Load failed"
    }

    return false
}

/** Dexie transaction aborted when the user navigates away mid-write. */
function isDexieTransactionAbort(error: unknown): boolean {
    return (
        error instanceof DOMException &&
        error.name === "InvalidStateError" &&
        error.message.includes("IDBTransaction")
    )
}

function shouldCaptureClientError(error: unknown): boolean {
    if (isAbortError(error) || isTransientNetworkError(error) || isDexieTransactionAbort(error)) {
        return false
    }

    if (error instanceof RaidHubError && EXPECTED_RAIDHUB_ERROR_CODES.has(error.errorCode)) {
        return false
    }

    if (error && typeof error === "object" && "data" in error) {
        const code = (error as { data?: { code?: string } }).data?.code
        if (code && EXPECTED_TRPC_ERROR_CODES.has(code)) {
            return false
        }
    }

    return true
}

export function captureClientException(error: unknown, context?: Record<string, unknown>): void {
    if (!shouldCaptureClientError(error)) {
        return
    }

    Sentry.captureException(error, { extra: context })
}

export function captureServerException(
    error: unknown,
    context?: {
        tags?: Record<string, string>
        extra?: Record<string, unknown>
    }
): void {
    if (!getSentryDsnForServer()) {
        return
    }

    Sentry.captureException(error, context)
}
