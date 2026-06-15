"use client"

import { useEffect } from "react"
import { PageWrapper } from "~/components/PageWrapper"
import { captureClientException } from "~/lib/sentry/capture"

export default function GlobalError({
    error,
    reset
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
        captureClientException(error, {
            tags: { capture_source: "global-error" },
            extra: {
                digest: error.digest ?? null,
                app_version: process.env.APP_VERSION ?? null
            }
        })
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
