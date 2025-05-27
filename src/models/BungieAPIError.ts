import type { BungieNetResponse } from "bungie-net-core/models"

export abstract class BungieHTTPError extends Error {
    public readonly status: number
    public readonly path: string

    constructor(message: string, status: number, path: string) {
        super(message)
        this.status = status
        this.path = path
    }
}

export class BungiePlatformError extends BungieHTTPError {
    public readonly name = "BungiePlatformError"
    public readonly cause: Omit<BungieNetResponse<unknown>, "Response">

    constructor(response: BungieNetResponse<unknown>, status: number, path: string) {
        super(response.Message, status, path)
        this.cause = response
    }

    get ErrorCode() {
        return this.cause.ErrorCode
    }
}

type BungieServiceErrorCause = {
    error: string
    error_description: string
}
export class BungieServiceError extends BungieHTTPError {
    public readonly name = "BungieServiceError"
    public readonly cause: BungieServiceErrorCause

    constructor(response: BungieServiceErrorCause, status: number, path: string) {
        super(response.error_description, status, path)
        this.cause = response
    }
}

export class BungieHTMLError extends BungieHTTPError {
    public readonly name = "BungieHTMLError"
    public readonly cause: string

    constructor(html: string, status: number, path: string) {
        super("HTML error", status, path)
        this.cause = html

        const match = html.match(BungieHTMLError.titleRegex)
        if (match) {
            this.message = match[1]
        }
    }

    static titleRegex = /<title>(.*?)<\/title>/
}

export class BungieUnkownHTTPError extends BungieHTTPError {
    public readonly name = "BungieUnkownHTTPError"
    public readonly cause: Response

    constructor(response: Response) {
        super(response.statusText, response.status, new URL(response.url).pathname)
        this.cause = response
    }
}
