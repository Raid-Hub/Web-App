/**
 * Sentry env helpers — same variable names as RaidHub-API (`SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`).
 * For the browser, `next.config.js` `env` inlines these at build time (same pattern as `APP_VERSION`), not `NEXT_PUBLIC_*`.
 */
export function getSentryDsnForServer(): string | undefined {
    const dsn = process.env.SENTRY_DSN?.trim()
    return dsn && dsn.length > 0 ? dsn : undefined
}

export function getSentryDsnForClient(): string | undefined {
    return getSentryDsnForServer()
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
