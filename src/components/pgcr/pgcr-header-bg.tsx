"use client"

import { FallbackSplash } from "../CloudflareImage"
import { useRaidHubManifest } from "../providers/RaidHubManifestManager"

export const PGCRHeaderBackground = ({
    activityId,
    versionId,
    children
}: {
    activityId: number
    versionId: number
    children: React.ReactNode
}) => {
    const { getImageVariantsForActivity, getImageVariantsForVersion, pantheonVersions } =
        useRaidHubManifest()

    const imageVariants = pantheonVersions.includes(versionId)
        ? getImageVariantsForVersion(versionId)
        : getImageVariantsForActivity(activityId)

    const variant = imageVariants.find(v => v.size === "small") ?? imageVariants[0]
    const backgroundImageUrl = variant?.url ?? FallbackSplash

    return (
        <div
            className="relative min-h-44 rounded-t-lg bg-cover bg-center md:min-h-48"
            style={{
                backgroundImage: `url(${backgroundImageUrl})`
            }}>
            {children}
        </div>
    )
}
