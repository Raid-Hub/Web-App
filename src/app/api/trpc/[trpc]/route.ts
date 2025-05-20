import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { type NextRequest } from "next/server"
import { createTRPCContext } from "~/lib/server/trpc"
import { trpcErrorHandler } from "~/lib/server/trpc/error-handler"
import { appRouter } from "~/lib/server/trpc/router"

const handler = (req: NextRequest) =>
    fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: createTRPCContext,
        onError: opts => trpcErrorHandler({ ...opts, source: "http" })
    })

export { handler as GET, handler as POST }
