import type { ErrorEvent, EventHint } from "@sentry/nextjs"

/** Next.js App Router control-flow signals — not application bugs. */
const NEXTJS_CONTROL_FLOW_ERRORS = ["NEXT_NOT_FOUND", "NEXT_REDIRECT"] as const

type TransactionLike = {
    transaction?: string
}

/** Standalone Prisma spans sampled as transactions — Turso latency noise, not app bugs. */
export function shouldDropSentryTransaction(event: TransactionLike): boolean {
    return event.transaction === "prisma:client:operation"
}

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
    beforeSendTransaction(event: TransactionLike): TransactionLike | null {
        return shouldDropSentryTransaction(event) ? null : event
    },
    ignoreErrors: [...NEXTJS_CONTROL_FLOW_ERRORS, "Unexpected token '{'"]
}
