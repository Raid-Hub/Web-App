"use client"

import { ErrorCard } from "~/components/ErrorCard"
import { RaidHubError } from "~/services/raidhub/RaidHubError"
import { type RaidHubErrorCode } from "~/services/raidhub/types"

export const ProfileError = ({ error }: { error: unknown }) =>
    error instanceof RaidHubError ? (
        <ErrorCard>
            <p>
                Error loading Profile: <code>{error.errorCode}</code>
            </p>
            <p>{getMessage(error.errorCode)}</p>
        </ErrorCard>
    ) : null

const getMessage = (errorCode: RaidHubErrorCode) => {
    switch (errorCode) {
        case "PlayerPrivateProfileError":
            return "The owner of this profile has chosen to keep their activity history private. No Peeking!"
        case "PlayerNotFoundError":
            return "This profile does not exist in RaidHub's database."
        default:
            return "An error occurred"
    }
}
