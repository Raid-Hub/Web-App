import type { BungieFetchConfig } from "bungie-net-core"
import EventEmitter from "events"
import { BungieHTTPError, BungiePlatformError } from "~/models/BungieAPIError"
import BaseBungieClient from "./BungieClient"

export default class ClientBungieClient extends BaseBungieClient {
    private accessToken: string | null = null

    private readonly emitter = new EventEmitter()

    protected generatePayload(config: BungieFetchConfig): { headers: Headers } {
        const apiKey = process.env.BUNGIE_API_KEY
        if (!apiKey) {
            throw new Error("Missing BUNGIE_API_KEY")
        }

        const payload: RequestInit & { headers: Headers } = {
            method: config.method,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            body: config.body,
            credentials: "omit",
            headers: new Headers(config.headers ?? {})
        }

        if (config.url.pathname.match(/\/Platform\//)) {
            payload.headers.set("X-API-KEY", apiKey)

            if (this.accessToken) {
                payload.headers.set("Authorization", `Bearer ${this.accessToken}`)
            }
        }

        return payload
    }

    protected async handle<T>(url: URL, payload: RequestInit): Promise<T> {
        try {
            return await this.request(url, payload)
        } catch (err) {
            if (url.pathname.match(/\/common\/destiny2_content\/json\//)) {
                url.searchParams.set("bust", String(Math.floor(Math.random() * 7777777)))
                return this.request(url, payload)
            } else if (
                !!this.accessToken &&
                ((err instanceof BungieHTTPError && err.status === 401) ||
                    (err instanceof BungiePlatformError &&
                        ClientBungieClient.AuthErrorCodes.has(err.ErrorCode)))
            ) {
                return await new Promise(resolve => {
                    const timeout = setTimeout(() => {
                        this.emitter.off("new-token", listener)
                        url.searchParams.set("retry", "authorization-timeout")
                        resolve(this.request(url, payload))
                    }, 5000)
                    const listener = () => {
                        clearTimeout(timeout)
                        url.searchParams.set("retry", "reauthorized")
                        resolve(this.request(url, payload))
                    }
                    this.emitter.once("new-token", listener)
                    this.emitter.emit("unauthorized")
                })
            } else if (
                err instanceof BungiePlatformError &&
                ClientBungieClient.RetryableErrorCodes.has(err.ErrorCode)
            ) {
                url.searchParams.set("retry", err.cause.ErrorStatus)
                return this.request(url, payload)
            } else {
                throw err
            }
        }
    }

    /**
     * Gets the current access token.
     * @returns The access token.
     */
    public readonly getToken = () => {
        return this.accessToken
    }

    /**
     * Sets the access token.
     * @param token.value The access token value.
     * @param token.expires The expiration date of the access token.
     */
    public readonly setToken = (token: { value: string; expires: Date }) => {
        if (token.value !== this.accessToken) {
            this.emitter.emit("new-token")
        }
        this.accessToken = token.value
    }

    /**
     * Clears the access token.
     */
    public readonly clearToken = () => {
        this.accessToken = null
    }

    public readonly onUnauthorized = (listener: () => void) => {
        this.emitter.once("unauthorized", listener)
        return () => {
            this.emitter.off("unauthorized", listener)
        }
    }
}
