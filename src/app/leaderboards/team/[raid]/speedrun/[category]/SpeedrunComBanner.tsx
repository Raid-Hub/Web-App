"use client"

import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { getRaidSplash } from "~/lib/activity-images"
import { SpeedrunVariables, type RTABoardCategory } from "~/lib/speedrun/speedrun-com-mappings"
import { Splash } from "../../../../LeaderboardSplashComponents"

export const SpeedrunComBanner = (props: {
    raidId: number
    raidPath: string
    category?: RTABoardCategory
}) => {
    const { getActivityString } = useRaidHubManifest()

    const title = getActivityString(props.raidId)
    const subtitle = props.category
        ? SpeedrunVariables[props.raidPath].variable?.values[props.category]?.displayName
        : undefined

    return (
        <Splash
            title={title}
            subtitle={subtitle}
            tertiaryTitle="Speedrun Leaderboards"
            cloudflareImageId={getRaidSplash(props.raidId) ?? "genericRaidSplash"}
        />
    )
}
