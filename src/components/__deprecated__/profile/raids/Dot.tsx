import { animate } from "framer-motion"
import Link from "next/link"
import { useCallback, useEffect, useRef, type MouseEvent } from "react"
import { useRaidCardContext } from "~/app/(profile)/raids/RaidCardContext"
import { DotFail, DotFlawless, DotSuccess, DotTaxi } from "~/app/(profile)/raids/constants"
import { useRaidHubManifest } from "~/app/layout/wrappers/RaidHubManifestManager"
import RaidSkull from "~/components/icons/RaidSkull"
import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { RADIUS, SKULL_FACTOR, SPACING, STAR_OFFSETS } from "./DotGraph"
import { type DotTooltipProps } from "./DotTooltip"
import styles from "./raids.module.css"

type DotProps = {
    activity: RaidHubInstanceForPlayer
    centerX: number
    centerY: number
    isTargeted: boolean
    tooltipData: DotTooltipProps | null
    setTooltip(data: DotTooltipProps | null): void
}

/** @deprecated */
const Dot = ({ centerX, activity, centerY, isTargeted, setTooltip, tooltipData }: DotProps) => {
    const { raidId } = useRaidCardContext()
    const { getActivityDefinition } = useRaidHubManifest()
    const isRaid = !!getActivityDefinition(raidId)?.isRaid
    const ref = useRef<HTMLAnchorElement | null>(null)
    const handleHover = useCallback(
        ({ clientX, currentTarget }: MouseEvent) => {
            // if anything breaks with the tooltip, check this first
            const containerToEdge =
                currentTarget.parentElement!.parentElement!.getBoundingClientRect().left
            const xOffset = clientX - containerToEdge + SPACING

            setTooltip({
                isShowing: true,
                activity,
                offset: {
                    x: xOffset,
                    y: centerY
                }
            })
        },
        [activity, centerY, setTooltip]
    )

    const handleMouseLeave = useCallback(
        ({}: MouseEvent) => {
            tooltipData &&
                setTooltip({
                    ...tooltipData,
                    isShowing: false
                })
        },
        [tooltipData, setTooltip]
    )

    useEffect(() => {
        if (isTargeted && ref.current) {
            ref.current.scrollIntoView({
                block: "nearest",
                inline: "center",
                behavior: "smooth"
            })

            void animate(
                ref.current,
                { opacity: [1, 0, 1] },
                { repeat: 3, duration: 1, type: "tween" }
            )
        }
    }, [isTargeted])

    const { elevatedDifficulties } = useRaidHubManifest()

    return (
        <Link
            href={`/pgcr/${activity.instanceId}`}
            ref={ref}
            onMouseEnter={handleHover}
            onMouseLeave={handleMouseLeave}
            className={[styles.dot, styles["dot-hover"]].join(" ")}>
            <circle
                fill={
                    activity.player.completed
                        ? activity.flawless
                            ? DotFlawless
                            : DotSuccess
                        : activity.completed
                          ? DotTaxi
                          : DotFail
                }
                fillOpacity={0.978}
                r={RADIUS}
                cx={centerX}
                cy={centerY}
            />

            {activity.completed && activity.playerCount <= 3 ? (
                <Star x={centerX} y={centerY} spinning={activity.playerCount === 1} />
            ) : (
                isRaid &&
                (activity.isContest || activity.isDayOne) && (
                    <RaidSkull
                        color="white"
                        width={2 * SKULL_FACTOR * RADIUS}
                        height={2 * SKULL_FACTOR * RADIUS}
                        x={centerX - SKULL_FACTOR * RADIUS}
                        y={centerY - SKULL_FACTOR * RADIUS}
                    />
                )
            )}
            {elevatedDifficulties.includes(activity.versionId) && (
                <circle
                    fill="none"
                    stroke="white"
                    strokeWidth={RADIUS / 10}
                    r={RADIUS * 0.95}
                    cx={centerX}
                    cy={centerY}
                />
            )}
        </Link>
    )
}

type StarProps = { x: number; y: number; spinning: boolean }
const Star = ({ x, y, spinning }: StarProps) => {
    const points = STAR_OFFSETS.map(([dx, dy]) => [x + dx, y + dy] as const)
    return (
        <polygon fill="white" points={points.map(coords => coords.join(",")).join(" ")}>
            {spinning && (
                <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    from={`0 ${x} ${y}`}
                    to={`360 ${x} ${y}`}
                    dur="4s"
                    repeatCount="indefinite"
                />
            )}
        </polygon>
    )
}

export default Dot
