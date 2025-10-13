"use client"

import { CloudflareActivitySplash } from "~/components/CloudflareImage"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
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
        <Splash title={title} subtitle={subtitle} tertiaryTitle="Speedrun Leaderboards">
            <CloudflareActivitySplash activityId={props.raidId} fill className="z-[-1]" />
        </Splash>
    )
}
