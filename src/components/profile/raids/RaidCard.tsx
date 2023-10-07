import styles from "~/styles/pages/profile/raids.module.css"
import { useEffect, useMemo, useState } from "react"
import { m } from "framer-motion"
import { Collection } from "@discordjs/collection"
import { Difficulty, ListedRaid, RaidsWithReprisedContest } from "~/types/raids"
import RaidCardBackground from "~/images/raid-backgrounds"
import { useLocale } from "~/components/app/LocaleManager"
import DotGraphWrapper, { FULL_HEIGHT } from "./DotGraph"
import BigNumberStatItem from "./BigNumberStatItem"
import Activity from "~/models/profile/data/Activity"
import Loading from "~/components/global/Loading"
import RaidStats from "~/models/profile/data/RaidStats"
import CloudflareImage from "~/images/CloudflareImage"
import { secondsToHMS } from "~/util/presentation/formatting"
import RaidTagLabel from "./RaidTagLabel"
import RaceTagLabel from "./RaceTagLabel"
import { includedIn } from "~/util/betterIncludes"
import Expand from "~/images/icons/Expand"

type RaidModalProps = {
    raid: ListedRaid
    expand: () => void
} & (
    | {
          stats: RaidStats
          isLoadingStats: false
      }
    | {
          stats: null
          isLoadingStats: true
      }
) &
    (
        | {
              isLoadingActivities: false
              activities: Collection<string, Activity>
          }
        | { isLoadingActivities: true; activities: null }
    )

const report = {
    fastestFullClear: {
        value: 1442,
        instanceId: "1"
    },
    averageFullClear: {
        value: 4891,
        instanceId: "1"
    },
    sherpaCount: 999,
    tags: [
        {
            instanceId: "12869660000",
            flawless: true,
            fresh: true,
            difficulty: Difficulty.NORMAL,
            bestPossible: true,
            playerCount: 2
        },
        {
            instanceId: "1",
            flawless: false,
            fresh: false,
            difficulty: Difficulty.MASTER,
            bestPossible: false,
            playerCount: 3
        }
    ],
    contestFirstClear: {
        dayOne: true,
        contest: true,
        weekOne: true,
        placement: 69
    }
}
const isLoadingReport = false

export default function RaidCard({
    raid,
    expand,
    stats,
    isLoadingStats,
    activities,
    isLoadingActivities
}: RaidModalProps) {
    const [hoveredTag, setHoveredTag] = useState<string | null>(null)

    useEffect(() => {
        if (hoveredTag) {
            // Set a new timeout
            const timer = setTimeout(() => {
                setHoveredTag(null)
            }, 2500)

            return () => {
                clearTimeout(timer)
            }
        }
    }, [hoveredTag])

    const recentClear = useMemo(() => activities?.find(a => a.completed && a.fresh), [activities])

    const { strings } = useLocale()

    return (
        <m.div
            initial={{
                y: 50,
                opacity: 0
            }}
            whileInView={{
                y: 0,
                opacity: 1
            }}
            viewport={{ once: true }}
            transition={{
                duration: 0.6
            }}
            className={styles["card"]}>
            <div className={styles["card-img-container"]}>
                <CloudflareImage
                    className={styles["card-background"]}
                    priority
                    width={960}
                    height={540}
                    cloudflareId={RaidCardBackground[raid]}
                    alt={strings.raidNames[raid]}
                />
                <div className={styles["card-top"]}>
                    {report?.contestFirstClear && (
                        <RaceTagLabel
                            {...report.contestFirstClear}
                            challenge={includedIn(RaidsWithReprisedContest, raid)}
                            raid={raid}
                            placement={report.contestFirstClear.placement ?? undefined}
                            setActiveId={setHoveredTag}
                        />
                    )}
                    <div
                        className={[styles["card-top-right"], styles["visible-on-card-hover"]].join(
                            " "
                        )}>
                        <Expand color="white" sx={25} onClick={expand} />
                    </div>
                </div>
                <div className={styles["img-overlay-bottom"]}>
                    <div className={styles["card-challenge-tags"]}>
                        {report?.tags?.map((tag, key) => (
                            <RaidTagLabel
                                {...tag}
                                raid={raid}
                                key={key}
                                setActiveId={setHoveredTag}
                            />
                        ))}
                    </div>
                    <span className={styles["card-title"]}>{strings.raidNames[raid]}</span>
                </div>
            </div>
            <div className={styles["card-content"]}>
                <div className={styles["graph-content"]}>
                    {isLoadingActivities ? (
                        <div className={styles["dots-container"]} style={{ height: FULL_HEIGHT }}>
                            <Loading className={styles["dots-svg-loading"]} />
                        </div>
                    ) : (
                        <DotGraphWrapper activities={activities} targetDot={hoveredTag} />
                    )}
                    <div className={styles["graph-right"]}>
                        <BigNumberStatItem
                            displayValue={stats?.totalClears ? stats.totalClears : 0}
                            isLoading={isLoadingStats}
                            name={strings.totalClears.split(" ").join("\n")}
                            extraLarge={true}
                        />
                    </div>
                </div>

                <div className={styles["timings"]}>
                    <BigNumberStatItem
                        displayValue={
                            recentClear ? secondsToHMS(recentClear.durationSeconds) : strings.na
                        }
                        isLoading={isLoadingActivities}
                        name="Recent"
                        href={recentClear ? `/pgcr/${recentClear.instanceId}` : undefined}
                    />
                    <BigNumberStatItem
                        displayValue={
                            report?.fastestFullClear
                                ? secondsToHMS(report.fastestFullClear.value)
                                : strings.na
                        }
                        isLoading={isLoadingReport}
                        name={strings.fastestClear}
                        href={
                            report?.fastestFullClear
                                ? `/pgcr/${report.fastestFullClear.instanceId}`
                                : undefined
                        }
                    />
                    <BigNumberStatItem
                        displayValue={
                            report?.averageFullClear
                                ? secondsToHMS(report.averageFullClear.value)
                                : strings.na
                        }
                        isLoading={isLoadingReport}
                        name={strings.averageClear}
                        href={
                            report?.averageFullClear
                                ? `/pgcr/${report.averageFullClear.instanceId}`
                                : undefined
                        }
                    />
                </div>
            </div>
        </m.div>
    )
}
