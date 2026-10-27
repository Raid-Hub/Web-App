import * as Sentry from "@sentry/nextjs"
import { isInterruptedRscStreamError } from "./policy"

const STORAGE_KEY_PREFIX = "raidhub:rsc-stream-reload:"
const RELOAD_GUARD_MS = 10_000

function readLastReload(key: string): number | null {
    try {
        const raw = window.sessionStorage.getItem(key)
        return raw ? Number(raw) : null
    } catch {
        return null
    }
}

function writeLastReload(key: string, value: number): boolean {
    try {
        window.sessionStorage.setItem(key, String(value))
        return true
    } catch {
        return false
    }
}

/**
 * When an RSC navigation payload is cut off mid-stream (user navigated away / rapid clicks),
 * the client router throws and the error boundary would render "Something went wrong".
 * Recover by hard-reloading the current URL once. If the same URL already reloaded recently
 * (or we can't persist the guard), report the failure and let the error UI render.
 *
 * Returns true if a reload was triggered (caller should skip its own capture/UI work).
 */
export function recoverFromInterruptedRscStream(
    error: Error & { digest?: string },
    source: string
): boolean {
    if (typeof window === "undefined" || !isInterruptedRscStreamError(error)) {
        return false
    }

    const url = window.location.href
    const key = STORAGE_KEY_PREFIX + url
    const now = Date.now()
    const lastReload = readLastReload(key)

    if (lastReload !== null && now - lastReload < RELOAD_GUARD_MS) {
        // Recovery already attempted and the stream failed again — this is not benign.
        Sentry.captureException(error, {
            tags: { capture_source: source, rsc_stream_recovery: "failed" },
            extra: {
                url,
                digest: error.digest ?? null,
                last_reload_ms_ago: now - lastReload
            }
        })
        return false
    }

    if (!writeLastReload(key, now)) {
        // Without a loop guard we can't safely auto-reload; surface it instead.
        Sentry.captureException(error, {
            tags: { capture_source: source, rsc_stream_recovery: "no_storage" },
            extra: { url, digest: error.digest ?? null }
        })
        return false
    }

    window.location.reload()
    return true
}
