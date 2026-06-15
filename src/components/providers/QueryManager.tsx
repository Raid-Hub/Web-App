"use client"

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { httpLink, loggerLink, type TRPCLink } from "@trpc/client"
import { observable } from "@trpc/server/observable"
import { useState } from "react"
import superjson from "superjson"
import { captureClientException } from "~/lib/sentry/capture"
import { type AppRouter } from "~/lib/server/trpc"
import { trpc } from "~/lib/trpc"

function getBaseUrl() {
    if (typeof window !== "undefined") return ""
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
    return `https://localhost:${process.env.PORT ?? 3000}`
}

const sentryLink: TRPCLink<AppRouter> = () => {
    return ({ next, op }) => {
        return observable(observer => {
            const subscription = next(op).subscribe({
                next(value) {
                    observer.next(value)
                },
                error(error) {
                    captureClientException(error, {
                        source: "trpc-client",
                        trpc_path: op.path,
                        trpc_type: op.type
                    })
                    observer.error(error)
                },
                complete() {
                    observer.complete()
                }
            })

            return () => subscription.unsubscribe()
        })
    }
}

export function QueryManager(props: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                queryCache: new QueryCache({
                    onError: (error, query) => {
                        // tRPC errors are captured by sentryLink — avoid double-reporting.
                        if (Array.isArray(query.queryKey[0])) {
                            return
                        }

                        captureClientException(error, {
                            source: "react-query",
                            queryKey: JSON.stringify(query.queryKey)
                        })
                    }
                }),
                defaultOptions: {
                    queries: {
                        staleTime: 60000,
                        refetchOnWindowFocus: false,
                        refetchOnReconnect: true,
                        retry: false,
                        refetchIntervalInBackground: false,
                        suspense: false,
                        useErrorBoundary: false,
                        retryDelay: failureCount => Math.min(2 ** failureCount * 1000, 30_000)
                    },
                    mutations: {
                        onError: error => {
                            captureClientException(error, { source: "react-query-mutation" })
                        }
                    }
                }
            })
    )

    const [trpcClient] = useState(() =>
        trpc.createClient({
            transformer: superjson,
            links: [
                loggerLink({
                    enabled: op =>
                        process.env.NODE_ENV === "development" ||
                        (op.direction === "down" && op.result instanceof Error)
                }),
                sentryLink,
                httpLink({
                    url: getBaseUrl() + "/api/trpc"
                })
            ]
        })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {/* By default, React Query Devtools are only included in bundles when 
            process.env.NODE_ENV === 'development', so you don't need to worry
             about excluding them during a production build. */}
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <ReactQueryDevtools initialIsOpen={false} />
                {props.children}
            </trpc.Provider>
        </QueryClientProvider>
    )
}
