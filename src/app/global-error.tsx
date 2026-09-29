"use client"

import { useEffect } from "react"
import { PageWrapper } from "~/components/PageWrapper"
import { captureClientException } from "~/lib/sentry/capture"

export default function GlobalError({
    error
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
                    {/*
                     * Full reload instead of reset(): re-initialising the App Router in place
                     * after a broken RSC stream can crash with a null router cache
                     * ("Cannot read properties of null (reading 'get')").
                     */}
                    <button onClick={() => window.location.reload()}>Try again</button>
                </PageWrapper>
            </body>
        </html>
    )
}
