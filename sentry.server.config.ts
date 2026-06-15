import * as Sentry from "@sentry/nextjs"
import {
    getSentryDsnForServer,
    getSentryEnvironment,
    getSentryRelease,
    getTracesSampleRate
} from "./src/lib/sentry/env"

const dsn = getSentryDsnForServer()

if (dsn) {
    Sentry.init({
        dsn,
        environment: getSentryEnvironment(),
        release: getSentryRelease(),
        tracesSampleRate: getTracesSampleRate(),
        debug: process.env.NODE_ENV !== "production"
    })
}
