"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"
import { PageWrapper } from "~/components/PageWrapper"
import { BungiePlatformError } from "~/models/BungieAPIError"
import { type ErrorBoundaryProps } from "~/types/generic"

export default function ClanErrorBoundary({ error, reset }: ErrorBoundaryProps) {
    useEffect(() => {
        console.error(error)
        Sentry.captureException(error, { tags: { error_boundary: "clan" } })
    }, [error])

    return (
        <PageWrapper>
            {error instanceof BungiePlatformError ? (
                <h1>{error.message}</h1>
            ) : (
                <h1>Something went wrong!</h1>
            )}
            <button onClick={() => reset()}>Try again</button>
        </PageWrapper>
    )
}
