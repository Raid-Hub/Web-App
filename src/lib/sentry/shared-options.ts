import type { ErrorEvent, EventHint } from "@sentry/nextjs"

/** Next.js control-flow errors thrown by the App Router — not application bugs. */
const NEXTJS_CONTROL_FLOW_ERRORS = ["NEXT_NOT_FOUND", "NEXT_REDIRECT"] as const

/** Expected user-facing auth outcomes (OAuth cancel, invalid callback state). */
const EXPECTED_AUTH_ERRORS = ["CallbackRouteError", "InvalidCheck", "State cookie was missing"] as const

/** Transient network failures surfaced by global handlers, not app bugs. */
const TRANSIENT_NETWORK_ERRORS = [
    "Load failed",
    "Failed to fetch",
    "fetch failed",
    "NetworkError when attempting to fetch resource"
] as const

/** Dexie unavailable in private browsing / storage-blocked WebViews. */
const DEXIE_ENVIRONMENT_ERRORS = ["OpenFailedError"] as const

export function shouldDropSentryEvent(event: ErrorEvent, _hint?: EventHint): boolean {
    const values = event.exception?.values
    if (!values?.length) {
        return false
    }

    return values.some(value => {
        const message = value.value ?? ""
        return (
            NEXTJS_CONTROL_FLOW_ERRORS.some(error => message.includes(error)) ||
            EXPECTED_AUTH_ERRORS.some(error => message.includes(error)) ||
            TRANSIENT_NETWORK_ERRORS.some(error => message.includes(error)) ||
            DEXIE_ENVIRONMENT_ERRORS.some(error => message.includes(error))
        )
    })
}

export const sentrySharedOptions = {
    beforeSend(event: ErrorEvent, hint: EventHint) {
        return shouldDropSentryEvent(event, hint) ? null : event
    },
    ignoreErrors: [
        ...NEXTJS_CONTROL_FLOW_ERRORS,
        ...EXPECTED_AUTH_ERRORS,
        ...TRANSIENT_NETWORK_ERRORS,
        ...DEXIE_ENVIRONMENT_ERRORS
    ]
}
