import type { ErrorEvent, EventHint } from "@sentry/nextjs"
import { shouldDropClientEvent } from "./policy"
import { shouldDropSentryEvent } from "./shared-options"

/** Client `beforeSend` — composes NEXT_* control flow + global-handler noise policy. */
export function beforeSendClientEvent(event: ErrorEvent, hint: EventHint): ErrorEvent | null {
    if (shouldDropSentryEvent(event, hint)) {
        return null
    }

    if (shouldDropClientEvent(event)) {
        return null
    }

    return event
}
