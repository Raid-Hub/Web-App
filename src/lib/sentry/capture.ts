import * as Sentry from "@sentry/nextjs"
import { buildSentryContext } from "./context"
import { getSentryDsnForServer } from "./env"
import { shouldSkipCapture } from "./policy"
import type { SentryCaptureContext } from "./types"

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
    if (shouldSkipCapture(error)) {
        return
    }

    const enriched = buildSentryContext(error, normalizeContext(context))
    Sentry.captureException(error, enriched)
}

export function captureServerException(error: unknown, context?: SentryCaptureContext): void {
    if (!getSentryDsnForServer() || shouldSkipCapture(error)) {
        return
    }

    const enriched = buildSentryContext(error, context)
    Sentry.captureException(error, enriched)
}
