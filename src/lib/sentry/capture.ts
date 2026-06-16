import type { ErrorEvent } from "@sentry/nextjs"
import * as Sentry from "@sentry/nextjs"
import { BungiePlatformError } from "~/models/BungieAPIError"
import BaseBungieClient from "~/services/bungie/BungieClient"
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

/** Expected aborts (navigation cancel, user cleared site data / IndexedDB). */
export function isBenignClientAbort(error: unknown): boolean {
    if (error instanceof DOMException && error.name === "AbortError") {
        return true
    }

    if (error instanceof Error && error.name === "AbortError") {
        return true
    }

    const message = getErrorMessage(error)
    return message.includes("AbortError") && message.includes("Database deleted")
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        const parts = [error.message]
        if (error.cause instanceof Error) {
            parts.push(error.cause.message)
        }
        return parts.join(" ")
    }

    return typeof error === "string" ? error : String(error)
}

function isBenignClientStorageError(error: unknown): boolean {
    const message = getErrorMessage(error)
    return (
        message.includes("OpenFailedError") ||
        message.includes("Database deleted by request of the user")
    )
}

function isBenignDataCloneError(error: unknown): boolean {
    if (error instanceof DOMException && error.name === "DataCloneError") {
        return true
    }

    return error instanceof Error && error.name === "DataCloneError"
}

function isExpectedBungiePlatformError(error: unknown): boolean {
    return (
        error instanceof BungiePlatformError &&
        BaseBungieClient.ExpectedErrorCodes.has(error.ErrorCode)
    )
}

function isTransientTrpcHtmlError(error: unknown): boolean {
    const message = getErrorMessage(error)
    return message.includes("Unexpected token '<'") || message.includes("<!DOCTYPE")
}

/** Client-side connectivity blips (Safari "Load failed", fetch abort offline). */
export function isAmbientNetworkError(error: unknown): boolean {
    const message = getErrorMessage(error)

    if (!(error instanceof TypeError) && !message.includes("Failed to fetch") && !message.includes("Load failed")) {
        return false
    }

    return (
        message === "Load failed" ||
        message === "Failed to fetch" ||
        message.includes("Failed to fetch (") ||
        message.includes("Load failed (") ||
        message.includes("NetworkError") ||
        message.includes("network error")
    )
}

export function shouldSkipQueryCacheCapture(
    error: unknown,
    query: { state: { data: unknown }; meta?: Record<string, unknown> | undefined }
): boolean {
    if (query.meta?.sentryCapture === false) {
        return true
    }

    // Refetch-on-focus/reconnect failed but stale data is still shown — not an app bug.
    return isAmbientNetworkError(error) && query.state.data !== undefined
}

function getEventErrorText(event: ErrorEvent): string {
    return (
        event.exception?.values
            ?.map(value => [value.type, value.value].filter(Boolean).join(": "))
            .join(" ") ?? ""
    )
}

/** Benign errors caught by Sentry's global unhandled-rejection handler (not captureClientException). */
export function shouldDropGlobalBenignEvent(event: ErrorEvent): boolean {
    const text = getEventErrorText(event)

    if (
        text.includes("Database deleted by request of the user") ||
        text.includes("OpenFailedError")
    ) {
        return true
    }

    if (text.includes("AbortError") && text.includes("Database deleted")) {
        return true
    }

    if (text.includes("DataCloneError") || text.includes("The object can not be cloned")) {
        return true
    }

    const hasAppStackFrame = event.exception?.values?.some(value =>
        value.stacktrace?.frames?.some(
            frame => typeof frame.filename === "string" && frame.filename.includes("/src/")
        )
    )

    // Unhandled rejections with no app frames — typically connectivity, not debuggable bugs.
    if (
        !hasAppStackFrame &&
        (text.includes("Failed to fetch") ||
            text.includes("Load failed") ||
            text.includes("NetworkError"))
    ) {
        return true
    }

    return false
}

function shouldCaptureError(error: unknown): boolean {
    if (isBenignClientAbort(error)) {
        return false
    }

    if (isBenignClientStorageError(error)) {
        return false
    }

    if (isBenignDataCloneError(error)) {
        return false
    }

    if (isExpectedBungiePlatformError(error)) {
        return false
    }

    if (isTransientTrpcHtmlError(error)) {
        return false
    }
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
