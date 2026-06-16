import * as Sentry from "@sentry/nextjs"
import {
    getSentryDsnForClient,
    getSentryEnvironment,
    getSentryRelease,
    getTracesSampleRate
} from "./lib/sentry/env"
import { shouldDropGlobalBenignEvent } from "./lib/sentry/capture"
import { sentrySharedOptions, shouldDropSentryEvent } from "./lib/sentry/shared-options"

const dsn = getSentryDsnForClient()

if (dsn) {
    Sentry.init({
        dsn,
        environment: getSentryEnvironment(),
        release: getSentryRelease(),
        tracesSampleRate: getTracesSampleRate(),
        debug: process.env.NODE_ENV !== "production",
        ...sentrySharedOptions,
        beforeSend(event, hint) {
            if (shouldDropSentryEvent(event, hint)) {
                return null
            }

            if (shouldDropGlobalBenignEvent(event)) {
                return null
            }

            return event
        }
    })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
