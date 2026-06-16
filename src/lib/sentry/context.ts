import { BungieHTTPError, BungiePlatformError } from "~/models/BungieAPIError"
import type { SentryCaptureContext } from "./types"

export type { SentryCaptureContext } from "./types"

export type BungieAuthFailureContext = {
    outcome: "recovery_timeout" | "recovery_retry_failed"
    bungiePath: string
    hadAccessToken: boolean
    waitedMs?: number
}

/** Attach bungie auth recovery metadata so Sentry events are actionable. */
export function withBungieAuthFailure(error: unknown, context: BungieAuthFailureContext): Error {
    const err = error instanceof Error ? error : new Error(String(error))
    Object.defineProperty(err, "bungieAuthFailure", { value: context, enumerable: true })
    return err
}

function getClientLocation(): Record<string, string> | undefined {
    if (typeof window === "undefined") {
        return undefined
    }

    const connection = (navigator as Navigator & { connection?: { effectiveType?: string } })
        .connection

    return {
        route_pathname: window.location.pathname,
        route_search: window.location.search,
        route_hash: window.location.hash,
        online: String(navigator.onLine),
        ...(connection?.effectiveType ? { network_effective_type: connection.effectiveType } : {})
    }
}

function getHistoryContext(): Record<string, unknown> | undefined {
    if (typeof window === "undefined") {
        return undefined
    }

    const { pathname } = window.location
    const state = window.history.state as { vanity?: string } | null

    return {
        history_state_vanity: state?.vanity ?? null,
        // Vanity cosmetic URLs: /username while the app route may still be /profile/...
        pathname_is_vanity_slug:
            !pathname.startsWith("/profile") &&
            !pathname.startsWith("/pgcr") &&
            !pathname.startsWith("/api") &&
            pathname.split("/").filter(Boolean).length === 1
    }
}

function classifyError(error: unknown): Record<string, string> {
    const message = error instanceof Error ? error.message : String(error)
    const tags: Record<string, string> = {}

    if (error instanceof BungieHTTPError) {
        tags.error_category = "bungie_api"
        tags.bungie_http_status = String(error.status)
        if (error.status === 401) {
            tags.error_category = "bungie_auth"
        }
    }

    if (error && typeof error === "object" && "bungieAuthFailure" in error) {
        tags.error_category = "bungie_auth"
        const failure = (error as { bungieAuthFailure: BungieAuthFailureContext }).bungieAuthFailure
        tags.bungie_auth_outcome = failure.outcome
    }

    if (message.includes("Maximum update depth exceeded")) {
        tags.error_category = "react_infinite_loop"
    }

    if (message.includes("removeChild") && message.includes("not a child")) {
        tags.error_category = "react_dom_reconciliation"
    }

    if (
        message === "Load failed" ||
        message === "Failed to fetch" ||
        message.includes("NetworkError") ||
        message.includes("network error")
    ) {
        tags.error_category = "network"
    }

    if (message.includes("Unexpected token '<'") || message.includes("<!DOCTYPE")) {
        tags.error_category = "html_instead_of_json"
    }

    if (error && typeof error === "object" && "data" in error) {
        const data = (error as { data?: { code?: string; httpStatus?: number } }).data
        if (data?.code) {
            tags.trpc_code = data.code
            tags.error_category = tags.error_category ?? "trpc"
        }
        if (data?.httpStatus) {
            tags.trpc_http_status = String(data.httpStatus)
        }
    }

    return tags
}

function extractErrorDetails(error: unknown): Record<string, unknown> {
    const extra: Record<string, unknown> = {}

    if (error instanceof BungieHTTPError) {
        extra.bungie_path = error.path
        extra.bungie_status = error.status
        extra.bungie_error_name = error.name
        if (error instanceof BungiePlatformError) {
            extra.bungie_error_code = error.ErrorCode
            extra.bungie_error_status = error.cause.ErrorStatus
        }
    }

    if (error && typeof error === "object" && "bungieAuthFailure" in error) {
        extra.bungie_auth_failure = (
            error as { bungieAuthFailure: BungieAuthFailureContext }
        ).bungieAuthFailure
    }

    if (error instanceof Error) {
        extra.error_name = error.name
        if ("digest" in error && typeof error.digest === "string") {
            extra.next_digest = error.digest
        }
        if (error.cause instanceof Error) {
            extra.cause_name = error.cause.name
            extra.cause_message = error.cause.message
        }
    }

    if (error && typeof error === "object" && "data" in error) {
        const data = (error as { data?: Record<string, unknown> }).data
        if (data) {
            extra.trpc_data = data
        }
    }

    if (error && typeof error === "object" && "shape" in error) {
        extra.trpc_shape = (error as { shape?: unknown }).shape
    }

    return extra
}

/** Merge caller context with auto-detected tags/extra for unresolved issues. */
export function buildSentryContext(
    error: unknown,
    callerContext?: SentryCaptureContext
): SentryCaptureContext {
    const tags: Record<string, string> = {
        ...classifyError(error),
        ...callerContext?.tags
    }

    const extra: Record<string, unknown> = {
        ...extractErrorDetails(error),
        ...getClientLocation(),
        ...getHistoryContext(),
        ...callerContext?.extra
    }

    // Promote known `source` from legacy flat extra into tags for grouping.
    const legacySource = callerContext?.extra?.source
    if (typeof legacySource === "string") {
        tags.capture_source = legacySource
    }

    return { tags, extra }
}

export function classifyAuthError(err: { name?: string; message?: string; cause?: unknown }): {
    tags: Record<string, string>
    extra: Record<string, unknown>
} {
    const name = err.name ?? ""
    const combinedText = getAuthErrorText(err)

    const likelyUserAction =
        name === "CallbackRouteError" ||
        name === "AccessDenied" ||
        name === "OAuthCallbackError" ||
        name === "OAuthSignInError" ||
        combinedText.includes("State cookie was missing") ||
        combinedText.includes("access_denied") ||
        combinedText.includes("errors.authjs.dev") ||
        combinedText.includes("No primary Destiny membership found")

    const extra: Record<string, unknown> = {
        auth_error_message: err.message ?? ""
    }

    if (err.cause instanceof Error) {
        extra.auth_cause_name = err.cause.name
        extra.auth_cause_message = err.cause.message
    } else if (err.cause !== undefined) {
        extra.auth_cause_type = typeof err.cause
    }

    return {
        tags: {
            auth_error_class: likelyUserAction ? "likely_user_action" : "investigate",
            auth_error_name: name || "unknown"
        },
        extra
    }
}

function getAuthErrorText(err: { message?: string; cause?: unknown }): string {
    const parts: string[] = []
    if (err.message) {
        parts.push(err.message)
    }

    let cause: unknown = err.cause
    for (let depth = 0; depth < 4 && cause; depth++) {
        if (cause instanceof Error) {
            parts.push(cause.message)
            cause = cause.cause
        } else {
            break
        }
    }

    return parts.join(" ")
}
