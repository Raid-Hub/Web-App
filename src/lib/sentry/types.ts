/** Tags/extra passed into capture helpers. */
export type SentryCaptureContext = {
    tags?: Record<string, string>
    extra?: Record<string, unknown>
}

/** React Query meta flag — opt out of Sentry for mutations (queries use key registry). */
export type SentryQueryMeta = {
    sentryCapture?: boolean
}
