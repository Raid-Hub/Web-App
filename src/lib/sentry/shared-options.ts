import type { TransactionEvent } from "@sentry/core"
import type { ErrorEvent, EventHint } from "@sentry/nextjs"

/** Next.js App Router control-flow signals — not application bugs. */
const NEXTJS_CONTROL_FLOW_ERRORS = ["NEXT_NOT_FOUND", "NEXT_REDIRECT"] as const

/** Standalone Prisma spans sampled as transactions — Turso latency noise, not app bugs. */
export function shouldDropSentryTransaction(event: TransactionEvent): boolean {
    const transaction =
        typeof event === "object" && event !== null && "transaction" in event
            ? (event as { transaction?: unknown }).transaction
            : undefined

    return transaction === "prisma:client:operation"
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
    beforeSendTransaction(event: TransactionEvent) {
        if (shouldDropSentryTransaction(event)) {
            return null
        }

        // TransactionEvent from @sentry/nextjs is `any` in ESLint; tsc expects the full event back.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- Sentry SDK transaction callback
        return event
    },
    ignoreErrors: [...NEXTJS_CONTROL_FLOW_ERRORS, "Unexpected token '{'"]
}
