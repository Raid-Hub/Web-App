import { Collection } from "@discordjs/collection"
import { useMemo } from "react"
import { Grid } from "~/components/__deprecated__/layout/Grid"
import RaidCard from "~/components/__deprecated__/profile/raids/RaidCard"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { RaidCardContext } from "./RaidCardContext"

export const PantheonLayout = ({
    instances,
    isLoading,
    isExpanded
}: {
    instances: Collection<string, RaidHubInstanceForPlayer>[]
    isExpanded: boolean
    isLoading: boolean
}) => {
    const { pantheonVersions } = useRaidHubManifest()

    const instancesByMode = useMemo(() => {
        if (isLoading) return null

        const coll = new Collection<number, Collection<string, RaidHubInstanceForPlayer>>()
        instances.forEach(group => {
            group.forEach(instance => {
                if (!coll.has(instance.versionId)) coll.set(instance.versionId, new Collection())
                coll.get(instance.versionId)!.set(instance.instanceId, instance)
            })
        })
        return coll
    }, [instances, isLoading])

    return (
        <Grid as="section" $minCardWidth={325} $minCardWidthMobile={300} $fullWidth $relative>
            {pantheonVersions
                .toSorted((a, b) => b - a)
                .map(mode => (
                    <RaidCardContext
                        key={mode}
                        activities={instancesByMode?.get(mode)}
                        isLoadingActivities={isLoading}
                        raidId={mode}>
                        <RaidCard leaderboardEntry={null} isExpanded={isExpanded} />
                    </RaidCardContext>
                ))}
        </Grid>
    )
}
