import * as Sentry from "@sentry/nextjs"
import { installBrowserCompatShims } from "./lib/browser-compat"
import { beforeSendClientEvent } from "./lib/sentry/client"

installBrowserCompatShims()
import {
    getSentryDsnForClient,
    getSentryEnvironment,
    getSentryRelease,
    getTracesSampleRate
} from "./lib/sentry/env"
import { sentrySharedOptions } from "./lib/sentry/shared-options"

const dsn = getSentryDsnForClient()

if (dsn) {
    Sentry.init({
        dsn,
        environment: getSentryEnvironment(),
        release: getSentryRelease(),
        tracesSampleRate: getTracesSampleRate(),
        debug: process.env.NODE_ENV !== "production",
        ...sentrySharedOptions,
        beforeSend: beforeSendClientEvent
    })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
