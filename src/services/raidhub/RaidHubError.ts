import {
    type RaidHubAPIErrorResponse,
    type RaidHubErrorCode,
    type RaidHubErrorSchema
} from "./types"

export class RaidHubError extends Error {
    readonly errorCode: RaidHubErrorCode
    readonly cause: RaidHubErrorSchema<RaidHubErrorCode>

    constructor(res: RaidHubAPIErrorResponse<RaidHubErrorCode>) {
        super(res.code)
        this.errorCode = res.code
        this.cause = res.error
    }
}

/** When the API returns an error envelope with a `message` field (e.g. ServiceUnavailable), surface it for BFF callers. */
export function getRaidHubErrorEnvelopeMessage(error: RaidHubError): string | undefined {
    const c = error.cause
    if (c && typeof c === "object" && "message" in c) {
        const m = (c as { message: unknown }).message
        if (typeof m === "string" && m.trim().length > 0) {
            return m
        }
    }
    return undefined
}
