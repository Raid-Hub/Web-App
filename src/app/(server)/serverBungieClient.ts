import "server-only"

import type { BungieFetchConfig } from "bungie-net-core"
import { BungiePlatformError } from "~/models/BungieAPIError"
import BaseBungieClient from "~/services/bungie/BungieClient"
import { baseUrl } from "../../lib/server"

export default class ServerBungieClient extends BaseBungieClient {
    private next: NextFetchRequestConfig
    private timeout?: number
    private cache?: RequestCache

    constructor({
        next,
        timeout,
        cache
    }: { next?: NextFetchRequestConfig; timeout?: number; cache?: RequestCache } = {}) {
        super()
        this.next = next ?? {}
        this.timeout = timeout
        this.cache = cache
    }

    generatePayload(config: BungieFetchConfig): { headers: Headers } {
        if (config.url.pathname.match(/\/common\/destiny2_content\/json\//)) {
            throw new Error("Manifest definitions are not available on the server")
        }

        const apiKey = process.env.BUNGIE_API_KEY
        if (!apiKey) {
            throw new Error("Missing BUNGIE_API_KEY")
        }

        const payload: RequestInit & { headers: Headers } = {
            method: config.method,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            body: config.body,
            headers: new Headers(config.headers),
            next: this.next,
            cache: this.cache
        }

        payload.headers.set("X-API-KEY", apiKey)
        payload.headers.set("Origin", baseUrl)

        if (this.timeout) {
            const controller = new AbortController()
            payload.signal = controller.signal
            setTimeout(() => controller.abort(), this.timeout)
        }

        return payload
    }

    async handle<T>(url: URL, payload: RequestInit): Promise<T> {
        try {
            return (await this.request(url, payload)) as T
        } catch (err) {
            if (
                !(err instanceof DOMException) &&
                !(
                    err instanceof BungiePlatformError &&
                    ServerBungieClient.ExpectedErrorCodes.has(err.ErrorCode)
                )
            ) {
                console.error(err)
                if (
                    err instanceof BungiePlatformError &&
                    ServerBungieClient.RetryableErrorCodes.has(err.ErrorCode)
                ) {
                    url.searchParams.set("retry", err.cause.ErrorStatus)
                    return this.request(url, payload) as T
                }
            }
            throw err
        }
    }
}
