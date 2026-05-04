import type { ProcedureType, TRPCError } from "@trpc/server"

export const trpcErrorHandler = async ({
    error,
    path
}: {
    error: TRPCError
    type: ProcedureType | "unknown"
    path?: string
    input: unknown
    source: "rpc" | "http"
}) => {
    console.error(`❌ tRPC failed on ${path ?? "<no-path>"}:`, error)
}
