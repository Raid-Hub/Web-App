/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import type { BungieClientProtocol, BungieFetchConfig } from "bungie-net-core"
import { type PlatformErrorCodes } from "bungie-net-core/models"
import {
    BungieHTMLError,
    BungiePlatformError,
    BungieServiceError,
    BungieUnkownHTTPError
} from "~/models/BungieAPIError"

/**
 * Represents a client for interacting with the Bungie API.
 */
export default abstract class BaseBungieClient implements BungieClientProtocol {
    /**
     * Makes a fetch request to the Bungie API.
     * @param config The fetch configuration.
     * @returns A promise that resolves to the response data.
     */
    public readonly fetch = async <T>(config: BungieFetchConfig): Promise<T> => {
        const payload = this.generatePayload(config)
        return this.handle(config.url, payload)
    }

    /**
     * Sends a request to the specified URL with the given payload.
     * @param url The URL to send the request to.
     * @param payload The request payload.
     * @returns A promise that resolves to the response data.
     */
    protected readonly request = async <T>(url: URL, payload: RequestInit): Promise<T> => {
        const res = await fetch(url, payload)

        const text = await res.text()
        const contentType = res.headers.get("Content-Type")

        if (!res.ok) {
            if (contentType?.includes("application/json")) {
                const data = JSON.parse(text)
                if ("ErrorCode" in data && data.ErrorCode !== 1) {
                    throw new BungiePlatformError(data, res.status, url.pathname)
                } else if ("error_description" in data) {
                    throw new BungieServiceError(data, res.status, url.pathname)
                }
            } else if (contentType?.includes("text/html")) {
                throw new BungieHTMLError(text, res.status, url.pathname)
            }
            throw new BungieUnkownHTTPError(res.clone())
        }

        return JSON.parse(text) as T
    }

    /**
     * Generates the payload for the fetch request.
     * @param config The fetch configuration.
     * @returns The generated payload.
     * @protected This method can be overridden in derived classes.
     */
    protected abstract generatePayload(config: BungieFetchConfig): { headers: Headers }

    /**
     * Handles the fetch request by making the request and handling errors.
     * It should delegate to the `request` method to make the request.
     * This is where retries and other custom error handling should be implemented.
     * @param url The URL to send the request to.
     * @param payload The request payload.
     * @returns A promise that resolves to the response data.
     * @protected This method can be overridden in derived classes.
     */
    protected abstract handle<T>(url: URL, payload: RequestInit): Promise<T>

    static readonly AuthErrorCodes = new Set<PlatformErrorCodes>([
        99, // WebAuthRequired
        22, // WebAuthModuleAsyncFailed
        2124, // AuthorizationRecordRevoked
        2123, // AuthorizationRecordExpired
        2122, // AuthorizationCodeStale
        2106 // AuthorizationCodeInvalid
    ])

    static readonly RetryableErrorCodes = new Set<PlatformErrorCodes>([
        1672, // DestinyThrottledByGameServer,
        1688 // DestinyDirectBabelClientTimeout
    ])

    static readonly ExpectedErrorCodes = new Set<PlatformErrorCodes>([
        5, // SystemDisabled
        686, // ClanNotFound
        1653 // PGCRNotFound
    ])
}
