import type { ErrorEvent } from "@sentry/nextjs"
import { BungiePlatformError } from "~/models/BungieAPIError"
import BaseBungieClient from "~/services/bungie/BungieClient"
import { RaidHubError } from "~/services/raidhub/RaidHubError"
import type { RaidHubErrorCode } from "~/services/raidhub/types"
import { classifyAuthError } from "./context"
import { isOptionalBungieQueryKey } from "./react-query"
import type { SentryQueryMeta } from "./types"

/**
 * Central Sentry capture policy.
 *
 * Prefer fixing root causes in app code over adding skip rules here.
 * Skip rules are for known non-actionable noise (env, handled API codes, optional probes).
 *
 * Layers:
 * - `shared-options.ts` — NEXT_NOT_FOUND / NEXT_REDIRECT only (App Router control flow)
 * - `shouldDropClientEvent` — global unhandled-rejection handler (no app stack)
 * - `shouldSkipCapture` — captureClientException / captureServerException
 * - `shouldSkipReactQueryCapture` / `shouldSkipTrpcCapture` — transport-specific rules
 */

/** RaidHub API codes already handled in UI — dedupe react-query/tRPC noise. */
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

const HANDLED_TRPC_ERROR_CODES = new Set(["NOT_FOUND", "UNAUTHORIZED", "FORBIDDEN", "BAD_REQUEST"])

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

function isBenignClientAbort(error: unknown): boolean {
    if (error instanceof DOMException && error.name === "AbortError") {
        return true
    }

    if (error instanceof Error && error.name === "AbortError") {
        return true
    }

    const message = getErrorMessage(error)
    return message.includes("AbortError") && message.includes("Database deleted")
}

function isBenignClientStorageError(error: unknown): boolean {
    const message = getErrorMessage(error)
    const name = error instanceof Error ? error.name : ""

    return (
        name === "DatabaseClosedError" ||
        message.includes("OpenFailedError") ||
        message.includes("Database deleted by request of the user") ||
        message.includes("Connection to Indexed Database server lost") ||
        message.includes("DatabaseClosedError")
    )
}

function isBenignDataCloneError(error: unknown): boolean {
    if (error instanceof DOMException && error.name === "DataCloneError") {
        return true
    }

    return error instanceof Error && error.name === "DataCloneError"
}

function isBenignDomMutationError(error: unknown): boolean {
    const message = getErrorMessage(error)
    const name =
        error instanceof DOMException ? error.name : error instanceof Error ? error.name : ""

    return (
        name === "NotFoundError" &&
        (message.includes("removeChild") || message.includes("The object can not be found here"))
    )
}

function isExtensionInjectedError(error: unknown): boolean {
    return /_0x[0-9a-f]+/i.test(getErrorMessage(error))
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

/** Client fetch failures that often succeed on retry (offline blip, tab sleep, CDN hiccup). */
export function isRetriableNetworkError(error: unknown): boolean {
    const message = getErrorMessage(error)

    if (
        !(error instanceof TypeError) &&
        !message.includes("Failed to fetch") &&
        !message.includes("Load failed")
    ) {
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

function getEventErrorText(event: ErrorEvent): string {
    return (
        event.exception?.values
            ?.map(value => [value.type, value.value].filter(Boolean).join(": "))
            .join(" ") ?? ""
    )
}

function eventHasAppStackFrame(event: ErrorEvent): boolean {
    return (
        event.exception?.values?.some(value =>
            value.stacktrace?.frames?.some(
                frame => typeof frame.filename === "string" && frame.filename.includes("/src/")
            )
        ) ?? false
    )
}

/** Shared skip rules for explicit capture paths (tRPC link, global-error, server). */
export function shouldSkipCapture(error: unknown): boolean {
    if (isBenignClientAbort(error)) {
        return true
    }

    if (isBenignClientStorageError(error)) {
        return true
    }

    if (isBenignDataCloneError(error)) {
        return true
    }

    if (isBenignDomMutationError(error)) {
        return true
    }

    if (isExtensionInjectedError(error)) {
        return true
    }

    if (isExpectedBungiePlatformError(error)) {
        return true
    }

    if (isTransientTrpcHtmlError(error)) {
        return true
    }

    if (error instanceof RaidHubError && HANDLED_RAIDHUB_ERROR_CODES.has(error.errorCode)) {
        return true
    }

    if (error && typeof error === "object" && "data" in error) {
        const code = (error as { data?: { code?: string } }).data?.code
        if (code && HANDLED_TRPC_ERROR_CODES.has(code)) {
            return true
        }
    }

    return false
}

/** tRPC client — connectivity blips while offline or on bad networks. */
export function shouldSkipTrpcCapture(error: unknown): boolean {
    return shouldSkipCapture(error) || isRetriableNetworkError(error)
}

export function shouldSkipReactQueryCapture(
    error: unknown,
    query: {
        queryKey: unknown
        state: { data: unknown }
        meta?: SentryQueryMeta
    }
): boolean {
    if (shouldSkipCapture(error)) {
        return true
    }

    if (query.meta?.sentryCapture === false) {
        return true
    }

    if (isOptionalBungieQueryKey(query.queryKey)) {
        return true
    }

    // Refetch failed but stale data is still shown — user-visible state is fine.
    return isRetriableNetworkError(error) && query.state.data !== undefined
}

export function shouldSkipMutationCapture(mutation: { meta?: SentryQueryMeta }): boolean {
    return mutation.meta?.sentryCapture === false
}

export function shouldSkipAuthServerCapture(err: {
    name?: string
    message?: string
    cause?: unknown
}): boolean {
    return classifyAuthError(err).tags.auth_error_class === "likely_user_action"
}

/**
 * Global handler path only (Sentry auto-instrumentation, not captureClientException).
 * App-frame errors always pass through so we can fix real bugs.
 */
export function shouldDropClientEvent(event: ErrorEvent): boolean {
    const text = getEventErrorText(event)

    if (
        text.includes("Database deleted by request of the user") ||
        text.includes("OpenFailedError") ||
        text.includes("Connection to Indexed Database server lost") ||
        text.includes("DatabaseClosedError")
    ) {
        return true
    }

    if (text.includes("AbortError") && text.includes("Database deleted")) {
        return true
    }

    if (text.includes("DataCloneError") || text.includes("The object can not be cloned")) {
        return true
    }

    if (text.includes("removeChild") || text.includes("The object can not be found here")) {
        return true
    }

    const hasAppStackFrame = eventHasAppStackFrame(event)

    if (
        !hasAppStackFrame &&
        (text.includes("Failed to fetch") ||
            text.includes("Load failed") ||
            text.includes("NetworkError"))
    ) {
        return true
    }

    // Extension / injected script noise (obfuscated identifiers, no app frames).
    if (!hasAppStackFrame && /_0x[0-9a-f]+/i.test(text)) {
        return true
    }

    return false
}
