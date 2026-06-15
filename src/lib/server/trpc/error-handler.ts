import * as Sentry from "@sentry/nextjs"
import type { ProcedureType, TRPCError } from "@trpc/server"
import { getSentryDsnForServer } from "~/lib/sentry/env"

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

    if (getSentryDsnForServer() && error.code === "INTERNAL_SERVER_ERROR") {
        const err = error.cause instanceof Error ? error.cause : error
        Sentry.captureException(err, {
            tags: {
                trpc_path: path ?? "unknown",
                trpc_source: source
            },
            extra: {
                code: error.code,
                input: input ?? null
            }
        })
    }
}
