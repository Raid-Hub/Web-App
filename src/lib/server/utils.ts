import "server-only"

import { headers } from "next/headers"
import { userAgent } from "next/server"

export const isStaticRequest = () => {
    const hdrs = headers()
    return (
        !userAgent({
            headers: hdrs
        }).ua && !Array.from(hdrs).length
    )
}

export const baseUrl =
    process.env.DEPLOY_URL ??
    (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `https://localhost:${process.env.PORT ?? 3000}`)
