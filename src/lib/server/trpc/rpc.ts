import "server-only"

import { createTRPCProxyClient, loggerLink, TRPCClientError } from "@trpc/client"
import { callProcedure, getTRPCErrorFromUnknown } from "@trpc/server"
import { observable } from "@trpc/server/observable"
import { type TRPCErrorResponse } from "@trpc/server/rpc"
import superjson from "superjson"
import { createTRPCContext, type AppRouter } from "."
import { trpcErrorHandler } from "./error-handler"
import { appRouter } from "./router"

export const trpcServer = createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
        loggerLink({
            enabled: op =>
                process.env.NODE_ENV === "development" ||
                (op.direction === "down" && op.result instanceof Error)
        }),
        /**
         * Custom RSC link that lets us invoke procedures without using http requests. Since Server
         * Components always run on the server, we can just call the procedure as a function.
         */
        () =>
            ({ op }) =>
                observable(observer => {
                    const ctx = createTRPCContext()

                    callProcedure({
                        procedures: appRouter._def.procedures,
                        path: op.path,
                        rawInput: op.input,
                        ctx,
                        type: op.type
                    })
                        .then(data => {
                            observer.next({ result: { data } })
                            observer.complete()
                        })
                        .catch((cause: TRPCErrorResponse) => {
                            void trpcErrorHandler({
                                error: getTRPCErrorFromUnknown(cause),
                                type: op.type,
                                path: op.path,
                                input: op.input,
                                source: "rpc"
                            })
                            observer.error(TRPCClientError.from(cause))
                        })
                })
    ]
})
