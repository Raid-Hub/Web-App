"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"
import { PageWrapper } from "~/components/PageWrapper"

export default function GlobalError({
    error,
    reset
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        Sentry.captureException(error)
        console.error(error)
    }, [error])

    return (
        <html>
            <body>
                <PageWrapper>
                    <h2>Something went wrong!</h2>
                    <button onClick={() => reset()}>Try again</button>
                </PageWrapper>
            </body>
        </html>
    )
}
