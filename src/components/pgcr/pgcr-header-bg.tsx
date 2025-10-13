"use client"

import { FallbackSplash } from "../CloudflareImage"
import { useRaidHubManifest } from "../providers/RaidHubManifestManager"

export const PGCRHeaderBackground = ({
    activityId,
    children
}: {
    activityId: number
    children: React.ReactNode
}) => {
    // getRaidSplash can return null for unknown activity ids; fall back to genericRaidSplash
    const { getImageVariantsForActivity } = useRaidHubManifest()
    const imageVariants = getImageVariantsForActivity(activityId)
    const variant = imageVariants.find(v => v.size === "small") ?? imageVariants[0]

    const backgroundImageUrl = variant.url ?? FallbackSplash
    return (
        <div
            className="relative min-h-44 overflow-hidden rounded-t-lg bg-cover bg-center md:h-48"
            style={{
                backgroundImage: `url(${backgroundImageUrl})`
            }}>
            {children}
        </div>
    )
}
