import { useMemo } from "react"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { DotBlacklisted, DotFail, DotFlawless, DotSuccess, DotTaxi } from "~/lib/profile/constants"
import { Tag } from "~/models/tag"
import type { RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { secondsToHMS } from "~/util/presentation/formatting"
import { getRelativeTime } from "~/util/presentation/pastDates"
import { FULL_HEIGHT } from "./DotGraph"
import styles from "./raids.module.css"

export type DotTooltipProps = {
    offset: {
        x: number
        y: number
    }
    isShowing: boolean
    activity: RaidHubInstanceForPlayer
}

/** @deprecated */
const DotTooltip = ({ offset, isShowing, activity }: DotTooltipProps) => {
    const { getVersionString } = useRaidHubManifest()
    const dateString = useMemo(
        () => getRelativeTime(new Date(activity.dateCompleted)),
        [activity.dateCompleted]
    )

    const lowman = activity.completed
        ? activity.playerCount === 1
            ? Tag.SOLO
            : activity.playerCount === 2
              ? Tag.DUO
              : activity.playerCount === 3
                ? Tag.TRIO
                : null
        : null

    return (
        <div
            role="tooltip"
            className={styles["dot-tooltip"]}
            style={{
                top: `${(offset.y / FULL_HEIGHT) * 100}%`,
                left: `${offset.x}px`,
                opacity: isShowing ? 1 : 0,
                borderColor: activity.isBlacklisted
                    ? DotBlacklisted
                    : activity.player.completed
                      ? activity.flawless
                          ? DotFlawless
                          : DotSuccess
                      : activity.completed
                        ? DotTaxi
                        : DotFail
            }}>
            <div>{secondsToHMS(activity.duration, false)}</div>
            <div className={styles["dot-tooltip-date"]}>{dateString}</div>
            <hr />
            <div className={styles["dot-tooltip-tags"]}>
                <span>{lowman}</span>
                <span>{activity.flawless && Tag.FLAWLESS}</span>
                <span>{getVersionString(activity.versionId)}</span>
            </div>
        </div>
    )
}

export default DotTooltip
