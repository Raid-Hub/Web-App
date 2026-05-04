/**
 * Sentry env helpers — align with RaidHub-API (`SENTRY_DSN`, `SENTRY_ENVIRONMENT`) and
 * Next.js client (`NEXT_PUBLIC_SENTRY_DSN` when the browser should report).
 */
export function getSentryDsnForServer(): string | undefined {
    const primary = process.env.SENTRY_DSN?.trim()
    if (primary) return primary
    const fallback = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()
    return fallback && fallback.length > 0 ? fallback : undefined
}

export function getSentryDsnForClient(): string | undefined {
    const primary = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()
    if (primary) return primary
    const fallback = process.env.SENTRY_DSN?.trim()
    return fallback && fallback.length > 0 ? fallback : undefined
}

export function getSentryEnvironment(): string {
    const fromSentry = process.env.SENTRY_ENVIRONMENT?.trim()
    if (fromSentry) return fromSentry
    const fromApp = process.env.APP_ENV
    if (fromApp) return fromApp
    return process.env.NODE_ENV === "production" ? "production" : "development"
}

export function getSentryRelease(): string | undefined {
    const fromRelease = process.env.SENTRY_RELEASE?.trim()
    if (fromRelease) return fromRelease
    const fromApp = process.env.APP_VERSION?.trim()
    if (fromApp) return fromApp
    const fromVercel = process.env.VERCEL_GIT_COMMIT_SHA?.trim()
    if (fromVercel) return fromVercel
    return undefined
}

export function getTracesSampleRate(): number {
    return process.env.NODE_ENV === "production" ? 0.01 : 0
}
