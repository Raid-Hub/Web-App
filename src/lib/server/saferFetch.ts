import { withRetries } from "./retry"

const retriableErrorCauseStrings = [
    "socket disconnected before secure TLS connection was established",
    "connect ETIMEDOUT",
    "other side closed",
    "write EPIPE",
    "read ECONNRESET",
    "ECONNRESET",
    "fetch failed",
    "network error",
    "Connection terminated unexpectedly"
]

function collectErrorMessages(err: unknown): string[] {
    const messages: string[] = []
    let current: unknown = err

    while (current instanceof Error) {
        messages.push(current.message)
        current = current.cause
    }

    return messages
}

function isRetriableFetchError(err: unknown): boolean {
    return collectErrorMessages(err).some(message =>
        retriableErrorCauseStrings.some(str => message.includes(str))
    )
}

// WeakMap to hold buffered request bodies for Requests we've seen before.
// Using a WeakMap lets buffers be garbage-collected when the original
// Request object is no longer referenced.
const bufferedRequestBodies = new WeakMap<Request, ArrayBuffer>()

const fetchWithBodyClone: typeof fetch = async (request, options) => {
    // If caller passed a Request instance, ensure its body is retryable by
    // constructing a fresh Request with an in-memory buffered body on each
    // attempt. We store the buffered body in `bufferedRequestBodies` so
    // subsequent attempts (when the original Request is already consumed)
    // can still recreate the body.
    if (request instanceof Request) {
        // No body to worry about — delegate directly.
        if (request.body == null) {
            return fetch(request, options)
        }

        // If we've already buffered this Request's body during a previous
        // attempt, use the stored buffer to construct a fresh Request.
        const existing = bufferedRequestBodies.get(request)
        if (existing) {
            const r = new Request(request, { body: existing })
            return fetch(r, options)
        }

        // If the body hasn't yet been consumed, buffer it now and store it
        // so future retries can use it.
        if (!request.bodyUsed) {
            try {
                const buf = await request.arrayBuffer()
                bufferedRequestBodies.set(request, buf)
                const r = new Request(request, { body: buf })
                return fetch(r, options)
            } catch (err) {
                throw new Error(
                    "Failed to buffer Request body for retry; ensure the request body is readable (ArrayBuffer/Uint8Array/string) or avoid sending a consumed stream.",
                    { cause: err }
                )
            }
        }

        // If we reach here, the request body was already used and we don't
        // have a buffered copy — it's not possible to retry safely.
        throw new TypeError(
            "Request body already used and cannot be retried. Provide a clonable body (string/Buffer/Uint8Array) or buffer the body before calling saferFetch."
        )
    }

    // For non-Request inputs (URL string + init) just delegate to global fetch.
    return fetch(request, options)
}

export const saferFetch = withRetries(
    {
        maxAttempts: 5,
        backoff: attempt => attempt ** 2 * 5,
        retryOn: isRetriableFetchError
    },
    fetchWithBodyClone
)
