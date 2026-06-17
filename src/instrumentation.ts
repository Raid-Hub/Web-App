import * as Sentry from "@sentry/nextjs"
import { shouldSkipCapture } from "./lib/sentry/policy"

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        await import("../sentry.server.config")
    } else if (process.env.NEXT_RUNTIME === "edge") {
        await import("../sentry.edge.config")
    }
}

export const onRequestError: typeof Sentry.captureRequestError = (error, request, errorContext) => {
    if (shouldSkipCapture(error)) {
        return
    }

    return Sentry.captureRequestError(error, request, errorContext)
}
