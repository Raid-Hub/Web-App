import * as Sentry from "@sentry/nextjs"
import {
    getSentryDsnForClient,
    getSentryEnvironment,
    getSentryRelease,
    getTracesSampleRate
} from "./lib/sentry/env"

const dsn = getSentryDsnForClient()

if (dsn) {
    Sentry.init({
        dsn,
        environment: getSentryEnvironment(),
        release: getSentryRelease(),
        tracesSampleRate: getTracesSampleRate(),
        debug: process.env.NODE_ENV !== "production"
    })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
