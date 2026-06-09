import { Collection } from "@discordjs/collection"
import { useMemo } from "react"
import { Grid } from "~/components/__deprecated__/layout/Grid"
import RaidCard from "~/components/__deprecated__/profile/raids/RaidCard"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { RaidCardContext } from "./RaidCardContext"

const PantheonModeGrid = ({
    modes,
    instancesByMode,
    isLoading,
    isExpanded
}: {
    modes: readonly number[]
    instancesByMode: Collection<number, Collection<string, RaidHubInstanceForPlayer>> | null
    isLoading: boolean
    isExpanded: boolean
}) => (
    <Grid as="section" $minCardWidth={325} $minCardWidthMobile={300} $fullWidth $relative>
        {modes.toSorted((a, b) => b - a).map(mode => (
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

export const PantheonLayout = ({
    instances,
    isLoading,
    isExpanded
}: {
    instances: Collection<string, RaidHubInstanceForPlayer>[]
    isExpanded: boolean
    isLoading: boolean
}) => {
    const {
        activeGauntletVersions,
        activePantheonBossVersions,
        gauntletVersions,
        pantheonBossVersions,
        isPantheonVersionSunset
    } = useRaidHubManifest()

    const activeModes = [...activeGauntletVersions, ...activePantheonBossVersions]
    const historicalModes = [...gauntletVersions, ...pantheonBossVersions].filter(id =>
        isPantheonVersionSunset(id)
    )

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
        <div className="flex w-full flex-col gap-6">
            <PantheonModeGrid
                modes={activeModes}
                instancesByMode={instancesByMode}
                isLoading={isLoading}
                isExpanded={isExpanded}
            />
            {historicalModes.length > 0 && (
                <div>
                    <h3 className="text-secondary mb-3 text-sm font-semibold tracking-wide uppercase">
                        Historical Modes
                    </h3>
                    <PantheonModeGrid
                        modes={historicalModes}
                        instancesByMode={instancesByMode}
                        isLoading={isLoading}
                        isExpanded={isExpanded}
                    />
                </div>
            )}
        </div>
    )
}
