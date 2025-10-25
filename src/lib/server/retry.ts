export type RetryOptions = {
    /** Total attempts including the first call (default: 3) */
    maxAttempts?: number
    /** Backoff function receiving the attempt number (1-based) and returning ms to wait */
    backoff?: (attempt: number) => number
    /** Predicate or list of Error classes to determine if an error should be retried */
    retryOn?: Array<new (...args: unknown[]) => Error> | ((err: unknown) => boolean)
    /** Optional hook called before waiting for the next attempt */
    onRetry?: (err: unknown, attempt: number) => void | Promise<void>
}

const defaultBackoff = (attempt: number) => Math.pow(2, attempt - 1) * 100

export class RetryError extends Error {
    constructor(
        message: string,
        public readonly attempts: number,
        public readonly errors: unknown[]
    ) {
        super(message, { cause: errors[errors.length - 1] })
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withRetries<F extends (...args: any[]) => Promise<unknown>>(
    opts: RetryOptions = {},
    fn: F
): F {
    const attempts = Math.max(1, opts.maxAttempts ?? 3)
    const backoff = opts.backoff ?? defaultBackoff

    const shouldRetry = (err: unknown) => {
        if (!opts.retryOn) return true
        if (typeof opts.retryOn === "function") return opts.retryOn(err)
        try {
            return opts.retryOn.some(cls => err instanceof cls)
        } catch {
            return false
        }
    }

    return (async (...args: Parameters<F>): Promise<ReturnType<F>> => {
        const errs: unknown[] = []
        for (let attempt = 1; attempt <= attempts; attempt++) {
            try {
                return (await fn(...args)) as ReturnType<F>
            } catch (err) {
                errs.push(err)
                const willRetry = attempt < attempts && shouldRetry(err)
                if (!willRetry) break

                if (opts.onRetry) {
                    try {
                        await opts.onRetry(err, attempt)
                    } catch {}
                }

                const waitMs = backoff(attempt)
                // eslint-disable-next-line no-await-in-loop
                await new Promise(resolve => setTimeout(resolve, waitMs))
            }
        }
        throw new RetryError(`Operation failed after ${attempts} attempts`, attempts, errs)
    }) as F
}
