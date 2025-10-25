import { errors } from "undici"
import { withRetries } from "./retry"

const retriableErrorCauseStrings = [
    "socket disconnected before secure TLS connection was established",
    "connect ETIMEDOUT"
]

export const saferFetch = withRetries(
    {
        maxAttempts: 5,
        backoff: attempt => attempt ** 2 * 5,
        retryOn: err => {
            if (err instanceof Error) {
                const cause = err.cause
                if (!cause) return false

                if (cause instanceof errors.SocketError) {
                    return true
                } else if (cause instanceof Error) {
                    return retriableErrorCauseStrings.some(str => cause.message.includes(str))
                }
            }

            return false
        }
    },
    fetch
)
