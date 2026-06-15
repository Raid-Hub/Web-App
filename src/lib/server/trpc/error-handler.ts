import type { ProcedureType, TRPCError } from "@trpc/server"
import { captureServerException } from "~/lib/sentry/capture"
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
        captureServerException(err, {
            tags: {
                capture_source: "trpc-server",
                trpc_path: path ?? "unknown",
                trpc_source: source,
                trpc_code: error.code
            },
            extra: {
                input: input ?? null,
                trpc_message: error.message
            }
        })
    }
}
