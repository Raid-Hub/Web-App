import { Collection } from "@discordjs/collection"
import { useCallback, useMemo } from "react"
import { CloudflareActivitySplash } from "~/components/CloudflareImage"
import { Grid } from "~/components/__deprecated__/layout/Grid"
import RaidCard from "~/components/__deprecated__/profile/raids/RaidCard"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { RaidCardContext } from "./RaidCardContext"

const getPantheonSectionTitle = (activityName: string) => {
    if (activityName === "Pantheon") return activityName
    const prefix = "Pantheon: "
    return activityName.startsWith(prefix) ? activityName.slice(prefix.length) : activityName
}

const PantheonSectionHeader = ({
    activityId,
    versionId,
    title
}: {
    activityId: number
    versionId: number
    title: string
}) => (
    <header className="border-border/40 flex items-center gap-3 border-b pb-3">
        <div className="ring-border/40 relative size-10 shrink-0 overflow-hidden rounded-lg ring-1 sm:size-11">
            <CloudflareActivitySplash
                activityId={activityId}
                versionId={versionId}
                alt=""
                fill
                className="object-cover brightness-[0.85]"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/55" />
        </div>
        <div className="min-w-0 flex-1">
            {title !== "Pantheon" && (
                <span className="text-muted-foreground block text-[10px] font-medium tracking-widest uppercase sm:text-[11px]">
                    Pantheon
                </span>
            )}
            <h3 className="text-foreground/95 truncate text-base font-semibold tracking-tight sm:text-lg">
                {title}
            </h3>
        </div>
    </header>
)

const PantheonModeGrid = ({
    modes,
    instancesByMode,
    isLoading,
    isExpanded,
    getActivityIdForVersion
}: {
    modes: readonly number[]
    instancesByMode: Collection<number, Collection<string, RaidHubInstanceForPlayer>> | null
    isLoading: boolean
    isExpanded: boolean
    getActivityIdForVersion: (versionId: number) => number
}) => (
    <Grid as="section" $minCardWidth={325} $minCardWidthMobile={300} $fullWidth $relative>
        {modes
            .toSorted((a, b) => b - a)
            .map(mode => (
                <RaidCardContext
                    key={mode}
                    activities={instancesByMode?.get(mode)}
                    isLoadingActivities={isLoading}
                    raidId={getActivityIdForVersion(mode)}
                    versionId={mode}>
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
        pantheonIds,
        pantheonVersions,
        versionDefinitions,
        activePantheonIds,
        getActivityString
    } = useRaidHubManifest()

    const getActivityIdForVersion = useCallback(
        (versionId: number) =>
            versionDefinitions[versionId]?.associatedActivityId ?? activePantheonIds[0] ?? 102,
        [activePantheonIds, versionDefinitions]
    )

    const pantheonSections = useMemo(
        () =>
            pantheonIds
                .map(activityId => {
                    const modes = pantheonVersions.filter(
                        versionId =>
                            versionDefinitions[versionId]?.associatedActivityId === activityId
                    )
                    return {
                        activityId,
                        title: getPantheonSectionTitle(getActivityString(activityId)),
                        headerVersionId: modes.toSorted((a, b) => b - a)[0],
                        modes
                    }
                })
                .filter(section => section.modes.length > 0),
        [getActivityString, pantheonIds, pantheonVersions, versionDefinitions]
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
        <div className="flex w-full flex-col gap-8">
            {pantheonSections.map(section => (
                <section key={section.activityId} className="flex flex-col gap-4">
                    <PantheonSectionHeader
                        activityId={section.activityId}
                        versionId={section.headerVersionId}
                        title={section.title}
                    />
                    <PantheonModeGrid
                        modes={section.modes}
                        instancesByMode={instancesByMode}
                        isLoading={isLoading}
                        isExpanded={isExpanded}
                        getActivityIdForVersion={getActivityIdForVersion}
                    />
                </section>
            ))}
        </div>
    )
}
