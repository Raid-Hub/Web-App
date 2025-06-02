"use client"

import { Collection } from "@discordjs/collection"
import { useMemo, useState } from "react"
import { useRaidCardContext } from "~/app/(profile)/raids/RaidCardContext"
import { WeeklyProgress } from "~/app/(profile)/raids/expanded/WeeklyProgress"
import { CloudflareImage } from "~/components/CloudflareImage"
import { Loading } from "~/components/Loading"
import { useLocale } from "~/components/providers/LocaleManager"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { useRaidTags } from "~/hooks/profile/useRaidTags"
import { useTimeout } from "~/hooks/util/useTimeout"
import { getRaidSplash } from "~/lib/activity-images"
import {
    type RaidHubInstanceForPlayer,
    type RaidHubWorldFirstEntry
} from "~/services/raidhub/types"
import { medianElement } from "~/util/math"
import { formattedNumber, secondsToHMS, secondsToYDHMS } from "~/util/presentation/formatting"
import BigNumberStatItem from "./BigNumberStatItem"
import DotGraphWrapper, { FULL_HEIGHT } from "./DotGraph"
import RaceTagLabel from "./RaceTagLabel"
import RaidTagLabel from "./RaidTagLabel"
import styles from "./raids.module.css"

/** @deprecated */
export default function RaidCard({
    leaderboardEntry,
    isExpanded
}: {
    leaderboardEntry: RaidHubWorldFirstEntry | null
    isExpanded?: boolean
}) {
    const { activities, isLoadingActivities, raidId } = useRaidCardContext()
    const { getVersionString, reprisedRaids, isChallengeMode, getActivityDefinition } =
        useRaidHubManifest()
    const { locale } = useLocale()

    const activityDefinition = getActivityDefinition(raidId)

    const isReprisedRaid = reprisedRaids.includes(raidId)

    const [hoveredTag, setHoveredTag] = useState<string | null>(null)

    useTimeout(() => setHoveredTag(null), 2500, [hoveredTag])

    const recentClear = useMemo(
        () => activities?.findLast(a => a.player.completed && a.fresh) ?? null,
        [activities]
    )

    const tags = useRaidTags(activities ?? new Collection())

    const firstContestClear = useMemo(() => {
        if (!activityDefinition) {
            return null
        }

        if (leaderboardEntry) {
            return leaderboardEntry
        }

        const elligibleActs = activities?.filter(a => !a.isBlacklisted && a.player.completed)

        const instance =
            (isReprisedRaid &&
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                elligibleActs?.find(a => isChallengeMode(a.versionId))) ||
            elligibleActs?.find(a => a.isContest || a.isWeekOne)
        if (!instance) return null

        return {
            instanceId: instance.instanceId,
            isDayOne: instance.isDayOne,
            isWeekOne: instance.isWeekOne,
            isContest: instance.isContest,
            isChallengeMode: isChallengeMode(instance.versionId),
            rank: null
        }
    }, [activities, isReprisedRaid, isChallengeMode, leaderboardEntry, activityDefinition])

    const { fastestFullClear, averageClear, stats } = useMemo(() => {
        const freshFulls = activities?.filter(a => a.player.completed && a.fresh)
        const fastestFullClear = freshFulls?.size
            ? freshFulls?.reduce<RaidHubInstanceForPlayer>((curr, nxt) =>
                  nxt.duration < curr.duration ? nxt : curr
              )
            : undefined

        const averageClear = freshFulls
            ? medianElement(freshFulls.toSorted((a, b) => a.duration - b.duration))
            : undefined

        // TODO: Implement this
        // const now = new Date()
        // const nextReset = new Date(now)

        // let daysToAdd = 2 - now.getUTCDay()
        // if (daysToAdd < 0) daysToAdd += 7 // If it's past Tuesday, add a week
        // if (daysToAdd === 0 && now.getUTCHours() >= 17) {
        //     // If it's Tuesday but past 17:00, wait for next Tuesday
        //     daysToAdd = 7
        // }

        // nextReset.setUTCHours(17, 0, 0, 0)
        // nextReset.setUTCDate(now.getUTCDate() + daysToAdd)

        // const millisecondsInWeek = 604800000
        // const uniqueLootedCharacterWeeks = new Set<string>()
        // activities
        //     ?.filter(a => a.player.completed)
        //     .forEach(a => {
        //         const reverseWeekNum = Math.ceil(
        //             (nextReset.getTime() - new Date(a.dateCompleted).getTime()) / millisecondsInWeek
        //         )
        //         // +
        //         uniqueLootedCharacterWeeks.add(a.player.characterId + reverseWeekNum)
        //     })

        const stats = activities?.reduce(
            (acc, curr) => {
                acc.timePlayedSeconds += curr.player.timePlayedSeconds
                if (curr.player.completed) {
                    acc.sherpas += curr.player.sherpas
                    if (curr.playerCount <= 3) {
                        acc.lowmans++
                    }
                }
                return acc
            },
            {
                timePlayedSeconds: 0,
                sherpas: 0,
                lowmans: 0
            }
        )

        return { fastestFullClear, averageClear, stats }
    }, [activities])

    return (
        <div className={styles.card}>
            <div className={styles["card-img-container"]}>
                <CloudflareImage
                    className={styles["card-background"]}
                    priority
                    width={960}
                    height={540}
                    cloudflareId={getRaidSplash(raidId) ?? "pantheonSplash"}
                    alt={
                        activityDefinition?.isRaid
                            ? activityDefinition.name
                            : getVersionString(raidId)
                    }
                />
                <div className={styles["card-top"]}>
                    {firstContestClear && (
                        <RaceTagLabel
                            rank={firstContestClear.rank}
                            instanceId={firstContestClear.instanceId}
                            isChallenge={firstContestClear.isChallengeMode}
                            isDayOne={firstContestClear.isDayOne}
                            isContest={firstContestClear.isContest}
                            isWeekOne={firstContestClear.isWeekOne}
                            setActiveId={setHoveredTag}
                        />
                    )}
                </div>
                <div className={styles["img-overlay-bottom"]}>
                    <div className={styles["card-challenge-tags"]}>
                        {tags?.map(tag => (
                            <RaidTagLabel
                                completed={tag.activity.completed}
                                key={tag.activity.instanceId}
                                activityId={tag.activity.activityId}
                                versionId={tag.activity.versionId}
                                setActiveId={setHoveredTag}
                                instanceId={tag.activity.instanceId}
                                isBestPossible={tag.bestPossible}
                                playerCount={tag.activity.playerCount}
                                fresh={tag.activity.fresh}
                                flawless={tag.activity.flawless}
                                isContest={tag.activity.isContest}
                            />
                        ))}
                    </div>
                    <span className={styles["card-title"]}>
                        {activityDefinition?.isRaid
                            ? activityDefinition.name
                            : getVersionString(raidId)}
                    </span>
                </div>
            </div>
            <div className={styles["card-content"]}>
                <div className={styles["graph-content"]}>
                    {isLoadingActivities ? (
                        <div className={styles["dots-container"]} style={{ height: FULL_HEIGHT }}>
                            <Loading $alpha={0.75} />
                        </div>
                    ) : (
                        <DotGraphWrapper activities={activities} targetDot={hoveredTag} />
                    )}
                    <div className={styles["graph-right"]}>
                        <BigNumberStatItem
                            displayValue={activities?.filter(a => a.player.completed).size ?? 0}
                            isLoading={isLoadingActivities}
                            name={"Total\nClears"}
                            extraLarge={true}
                        />
                    </div>
                </div>

                <div className={styles.timings}>
                    <BigNumberStatItem
                        displayValue={
                            recentClear ? secondsToHMS(recentClear.duration, false) : "N/A"
                        }
                        isLoading={isLoadingActivities}
                        name="Recent"
                        href={recentClear ? `/pgcr/${recentClear.instanceId}` : undefined}
                    />
                    <BigNumberStatItem
                        displayValue={
                            fastestFullClear
                                ? secondsToHMS(fastestFullClear.duration, false)
                                : "N/A"
                        }
                        isLoading={isLoadingActivities}
                        name="Fastest"
                        href={fastestFullClear ? `/pgcr/${fastestFullClear.instanceId}` : undefined}
                    />
                    <BigNumberStatItem
                        displayValue={
                            averageClear ? secondsToHMS(averageClear.duration, false) : "N/A"
                        }
                        isLoading={isLoadingActivities}
                        name="Average"
                        href={averageClear ? `/pgcr/${averageClear.instanceId}` : undefined}
                    />
                </div>
                {isExpanded && (
                    <>
                        <div className={styles.timings}>
                            <BigNumberStatItem
                                displayValue={
                                    stats ? secondsToYDHMS(stats.timePlayedSeconds, 2) : 0
                                }
                                isLoading={isLoadingActivities}
                                name="Time Played"
                            />
                            <BigNumberStatItem
                                displayValue={stats ? formattedNumber(stats.sherpas, locale) : 0}
                                isLoading={isLoadingActivities}
                                name="Sherpas"
                            />
                            <BigNumberStatItem
                                displayValue={stats ? formattedNumber(stats.lowmans, locale) : 0}
                                isLoading={isLoadingActivities}
                                name="Lowmans"
                            />
                            {/* <BigNumberStatItem
                                displayValue={formattedNumber(looted, locale)}
                                isLoading={isLoadingActivities}
                                name="Looted"
                            /> */}
                        </div>
                        {activityDefinition?.isRaid && !activityDefinition.isSunset && (
                            <WeeklyProgress raid={activityDefinition.id} />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
