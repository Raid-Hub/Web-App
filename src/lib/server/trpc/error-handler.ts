import * as Sentry from "@sentry/nextjs"
import type { ProcedureType, TRPCError } from "@trpc/server"

export const trpcErrorHandler = async ({
    error,
    path,
    input,
    source
}: {
    error: TRPCError
    type: ProcedureType | "unknown"
    path?: string
    input: unknown
    source: "rpc" | "http"
}) => {
    console.error(`❌ tRPC failed on ${path ?? "<no-path>"}:`, error)

    // Capture exception with Sentry with additional context
    Sentry.withScope(scope => {
        scope.setContext("trpc", {
            path: path ?? "<no-path>",
            input: input,
            source: source
        })
        Sentry.captureException(error)
    })
}
