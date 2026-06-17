import * as Sentry from "@sentry/nextjs"

/** Edge-safe — do not import policy.ts here (pulls client/server deps into edge bundle). */
function shouldSkipServerRequestError(error: unknown): boolean {
    let current: unknown = error
    for (let depth = 0; depth < 5 && current; depth++) {
        if (current instanceof Error && current.name === "AbortError") {
            return true
        }

        current = current instanceof Error ? current.cause : undefined
    }

    if (error instanceof Error) {
        const message = error.message
        return (
            message.includes("Operation failed after") &&
            message.includes("attempt") &&
            message.toLowerCase().includes("abort")
        )
    }

    return false
}

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        await import("../sentry.server.config")
    } else if (process.env.NEXT_RUNTIME === "edge") {
        await import("../sentry.edge.config")
    }
}

export const onRequestError: typeof Sentry.captureRequestError = (error, request, errorContext) => {
    if (shouldSkipServerRequestError(error)) {
        return
    }

    return Sentry.captureRequestError(error, request, errorContext)
}
