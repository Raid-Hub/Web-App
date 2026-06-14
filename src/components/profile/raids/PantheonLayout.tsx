import { Collection } from "@discordjs/collection"
import { useCallback, useMemo } from "react"
import { Grid } from "~/components/__deprecated__/layout/Grid"
import RaidCard from "~/components/__deprecated__/profile/raids/RaidCard"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { suppressesDayOnePlacement } from "~/lib/pgcr/leaderboard-tag"
import {
    type RaidHubGauntletRaceEntry,
    type RaidHubInstanceForPlayer,
    type RaidHubPantheonVersionFirstEntry,
    type RaidHubWorldFirstEntry
} from "~/services/raidhub/types"
import { RaidCardContext } from "./RaidCardContext"

const toGauntletRaceLeaderboardEntry = (
    entry: RaidHubGauntletRaceEntry,
    activityId: number
): RaidHubWorldFirstEntry => ({
    activityId,
    instanceId: entry.instanceId,
    timeAfterLaunch: 0,
    rank: entry.rank,
    isDayOne: false,
    isContest: false,
    isWeekOne: false,
    isChallengeMode: false,
    isGauntletRace: true
})

const toPantheonVersionFirstLeaderboardEntry = (
    entry: RaidHubPantheonVersionFirstEntry,
    activityId: number,
    versionLabel: string
): Omit<RaidHubWorldFirstEntry, "rank"> & {
    rank: number | null
    versionLabel?: string | null
} => ({
    activityId,
    instanceId: entry.instanceId,
    timeAfterLaunch: 0,
    rank: entry.isDayOne && suppressesDayOnePlacement(entry.versionId) ? null : entry.rank,
    isDayOne: entry.isDayOne,
    isContest: false,
    isWeekOne: false,
    isChallengeMode: false,
    isGauntletRace: false,
    versionLabel: entry.isDayOne ? null : versionLabel
})

const resolvePantheonLeaderboardEntry = (
    mode: number,
    activityId: number,
    gauntletRaceEntry: RaidHubGauntletRaceEntry | null,
    pantheonVersionFirstEntries: Collection<number, RaidHubPantheonVersionFirstEntry>,
    getVersionString: (versionId: number) => string
):
    | (Omit<RaidHubWorldFirstEntry, "rank"> & {
          rank: number | null
          versionLabel?: string | null
      })
    | null => {
    const versionFirst = pantheonVersionFirstEntries.get(mode) ?? null
    const gauntlet = gauntletRaceEntry?.versionId === mode ? gauntletRaceEntry : null

    if (gauntlet) {
        return toGauntletRaceLeaderboardEntry(gauntlet, activityId)
    }

    if (versionFirst) {
        return toPantheonVersionFirstLeaderboardEntry(
            versionFirst,
            activityId,
            getVersionString(mode)
        )
    }

    return null
}

const PantheonModeGrid = ({
    modes,
    instancesByMode,
    isLoading,
    isExpanded,
    getActivityIdForVersion,
    gauntletRaceEntry,
    pantheonVersionFirstEntries,
    getVersionString
}: {
    modes: readonly number[]
    instancesByMode: Collection<number, Collection<string, RaidHubInstanceForPlayer>> | null
    isLoading: boolean
    isExpanded: boolean
    getActivityIdForVersion: (versionId: number) => number
    gauntletRaceEntry: RaidHubGauntletRaceEntry | null
    pantheonVersionFirstEntries: Collection<number, RaidHubPantheonVersionFirstEntry>
    getVersionString: (versionId: number) => string
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
                    <RaidCard
                        leaderboardEntry={resolvePantheonLeaderboardEntry(
                            mode,
                            getActivityIdForVersion(mode),
                            gauntletRaceEntry,
                            pantheonVersionFirstEntries,
                            getVersionString
                        )}
                        isExpanded={isExpanded}
                    />
                </RaidCardContext>
            ))}
    </Grid>
)

export const PantheonLayout = ({
    instances,
    isLoading,
    isExpanded,
    gauntletRaceEntry,
    pantheonVersionFirstEntries
}: {
    instances: Collection<string, RaidHubInstanceForPlayer>[]
    isExpanded: boolean
    isLoading: boolean
    gauntletRaceEntry: RaidHubGauntletRaceEntry | null
    pantheonVersionFirstEntries: Collection<number, RaidHubPantheonVersionFirstEntry>
}) => {
    const {
        activePantheonVersions,
        pantheonSunsetVersions,
        versionDefinitions,
        activePantheonIds,
        getVersionString
    } = useRaidHubManifest()

    const getActivityIdForVersion = useCallback(
        (versionId: number) =>
            versionDefinitions[versionId]?.associatedActivityId ?? activePantheonIds[0] ?? 102,
        [activePantheonIds, versionDefinitions]
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
                modes={activePantheonVersions}
                instancesByMode={instancesByMode}
                isLoading={isLoading}
                isExpanded={isExpanded}
                getActivityIdForVersion={getActivityIdForVersion}
                gauntletRaceEntry={gauntletRaceEntry}
                pantheonVersionFirstEntries={pantheonVersionFirstEntries}
                getVersionString={getVersionString}
            />
            {pantheonSunsetVersions.length > 0 && (
                <div>
                    <h3 className="text-secondary mb-3 text-sm font-semibold tracking-wide uppercase">
                        Historical Modes
                    </h3>
                    <PantheonModeGrid
                        modes={pantheonSunsetVersions}
                        instancesByMode={instancesByMode}
                        isLoading={isLoading}
                        isExpanded={isExpanded}
                        getActivityIdForVersion={getActivityIdForVersion}
                        gauntletRaceEntry={gauntletRaceEntry}
                        pantheonVersionFirstEntries={pantheonVersionFirstEntries}
                        getVersionString={getVersionString}
                    />
                </div>
            )}
        </div>
    )
}
