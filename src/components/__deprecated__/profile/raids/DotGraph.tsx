import { type Collection } from "@discordjs/collection"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useFilterContext } from "~/components/profile/raids/FilterContext"
import type { RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { median } from "~/util/math"
import Dot from "./Dot"
import DotTooltip, { type DotTooltipProps } from "./DotTooltip"
import styles from "./raids.module.css"

// constants used to manage the height of the graph
const CANVAS_HEIGHT = 60
export const BORDER = 7
export const SPACING = 20
export const RADIUS = 6.5
// calculated constants
const MIN_Y = BORDER + 2 * RADIUS
const LINE_Y = 0.6 * CANVAS_HEIGHT + BORDER
const MAX_Y = BORDER + CANVAS_HEIGHT - 2 * RADIUS
export const FULL_HEIGHT = CANVAS_HEIGHT + 2 * BORDER

// STAR
const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180)
// legs
const dxLeg = RADIUS * Math.sin(degreesToRadians(36)) // x
const dyLeg = RADIUS * Math.cos(degreesToRadians(36)) // y
// arms
const dxArm = RADIUS * Math.cos(degreesToRadians(18)) // x
const dyArm = RADIUS * Math.sin(degreesToRadians(18)) // y
export const STAR_OFFSETS = [
    [0, -RADIUS], // top
    [-dxLeg, dyLeg], // left leg
    [dxArm, -dyArm], // right arm
    [-dxArm, -dyArm], // left arm
    [dxLeg, dyLeg] // right leg
] as const

// SKULL
export const SKULL_FACTOR = 1.15

type DotGraphWrapperProps = {
    activities: Collection<string, RaidHubInstanceForPlayer>
    targetDot: string | null
}

/** @deprecated */
export default memo(function DotGraphWrapper({
    activities: unfilteredActivities,
    targetDot
}: DotGraphWrapperProps) {
    const { filter } = useFilterContext()
    const filterPredicate = useMemo(
        () => filter?.filter.predicate.bind(filter.filter) ?? (() => true),
        [filter]
    )
    const activities = useMemo(
        () => unfilteredActivities.filter(filterPredicate),
        [filterPredicate, unfilteredActivities]
    )
    const getHeight = useMemo(() => {
        let { min, max } = activities.reduce(
            (soFar, a) => {
                const cvTime = a.duration
                return {
                    min: Math.min(soFar.min, cvTime),
                    max: Math.max(soFar.max, cvTime)
                }
            },
            {
                min: Number.MAX_SAFE_INTEGER,
                max: 0
            }
        )

        if (activities.size === 1) {
            min -= 1
            max += 1
        }

        const orderedByDuration = activities.map(a => a.duration).sort((a, b) => a - b) ?? []
        const avg = median(orderedByDuration)
        return findCurve([min, MIN_Y], [avg, LINE_Y], [max, MAX_Y])
    }, [activities])

    return <DotGraph getHeight={getHeight} dots={activities} targetDot={targetDot} />
})

type DotGraphProps = {
    getHeight: (duration: number) => number
    dots: Collection<string, RaidHubInstanceForPlayer>
    targetDot: string | null
}

const DotGraph = memo(function DotGraph({ dots, getHeight, targetDot }: DotGraphProps) {
    const [dotTooltipData, setDotTooltipData] = useState<DotTooltipProps | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    const [dotRange, setDotRange] = useState([0, 0])

    const updateVisibleCanvas = useCallback(() => {
        if (svgRef.current && containerRef.current) {
            const { left, right } = containerRef.current.getBoundingClientRect()
            const { x } = svgRef.current.getBoundingClientRect()
            const min = (left - x - SPACING / 2) / SPACING
            const max = (right - x - SPACING / 2) / SPACING

            setDotRange([
                Math.max(0, Math.round(min - 12)),
                Math.min(Math.round(max + 12), dots.size)
            ])
        }
    }, [dots])

    // update visible canvas when size of canvas changes
    useEffect(() => {
        const observer = new ResizeObserver(updateVisibleCanvas)
        containerRef.current && observer.observe(containerRef.current)
        return () => {
            observer.disconnect()
        }
    }, [updateVisibleCanvas])

    // update visible canvas when scrolling
    useEffect(() => {
        const currRef = containerRef.current
        if (currRef) {
            currRef.addEventListener("scroll", updateVisibleCanvas)
            return () => {
                currRef.removeEventListener("scroll", updateVisibleCanvas)
            }
        }
    }, [containerRef, svgRef, updateVisibleCanvas])

    // update visible canvas when dots change
    useEffect(updateVisibleCanvas, [dots, updateVisibleCanvas])

    const targetted = targetDot ? dots.get(targetDot) : null

    const dotArr = useMemo(() => Array.from(dots.values()), [dots])

    return (
        <div
            ref={containerRef}
            className={styles["dots-container"]}
            style={{ height: FULL_HEIGHT }}>
            {dotTooltipData && <DotTooltip {...dotTooltipData} />}
            <svg
                ref={svgRef}
                style={{
                    width: SPACING * (dots?.size ?? 200) + "px",
                    height: FULL_HEIGHT,
                    minWidth: "100%"
                }}>
                <line
                    x1="0%"
                    y1={LINE_Y}
                    x2="100%"
                    y2={LINE_Y}
                    style={{ stroke: "rgb(92, 92, 92)", strokeWidth: "2" }}
                />
                {dotArr.slice(dotRange[0], dotRange[1]).map((a, idx) => (
                    <Dot
                        key={a.instanceId}
                        centerX={SPACING / 2 + SPACING * (idx + dotRange[0])}
                        activity={a}
                        centerY={getHeight(a.duration)}
                        setTooltip={setDotTooltipData}
                        tooltipData={dotTooltipData}
                        isTargeted={a.instanceId === targetDot}
                    />
                ))}
                {/* Ensure the target dot is rendered */}
                {targetted && (
                    <Dot
                        key={targetted.instanceId}
                        centerX={
                            SPACING / 2 +
                            SPACING * dotArr.findIndex(a => a.instanceId === targetDot)
                        }
                        activity={targetted}
                        centerY={getHeight(targetted.duration)}
                        setTooltip={setDotTooltipData}
                        tooltipData={dotTooltipData}
                        isTargeted={true}
                    />
                )}
            </svg>
        </div>
    )
})

type Point = [number, number]

// Returns a function to determine the Y coordinate of a dot based on the slowest, fastest, and avg runs
function findCurve(min: Point, avg: Point, max: Point): (duration: number) => number {
    const [s1, y1] = min
    const [s2, y2] = avg
    const [s3, y3] = max

    const lower = (speed: number): number => {
        const slope = (y2 - y1) / (s2 - s1 || 1)
        const b = y1 - slope * s1
        return slope * speed + b
    }

    const upper = (speed: number): number => {
        const slope = (y3 - y2) / (s3 - s2 || 1)
        const b = y2 - slope * s2
        return slope * speed + b
    }

    // Return the function to determine the Y coordinate depending on if the speed is above or below the median
    return (duration: number) => {
        return duration <= s2 ? lower(duration) : upper(duration)
    }
}
