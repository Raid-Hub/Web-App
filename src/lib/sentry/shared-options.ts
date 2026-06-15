import type { ErrorEvent, EventHint } from "@sentry/nextjs"

/** Next.js control-flow errors thrown by the App Router — not application bugs. */
const NEXTJS_CONTROL_FLOW_ERRORS = ["NEXT_NOT_FOUND", "NEXT_REDIRECT"] as const

export function shouldDropSentryEvent(event: ErrorEvent, _hint?: EventHint): boolean {
    const values = event.exception?.values
    if (!values?.length) {
        return false
    }

    return values.some(value => {
        const message = value.value ?? ""
        return NEXTJS_CONTROL_FLOW_ERRORS.some(error => message.includes(error))
    })
}

export const sentrySharedOptions = {
    beforeSend(event: ErrorEvent, hint: EventHint) {
        return shouldDropSentryEvent(event, hint) ? null : event
    },
    ignoreErrors: [...NEXTJS_CONTROL_FLOW_ERRORS]
}
