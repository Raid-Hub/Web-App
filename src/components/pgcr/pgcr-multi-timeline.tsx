"use client"

import Link from "next/link"
import { useCallback, useMemo } from "react"
import { type MultiInstanceTimelineSegment } from "~/lib/multi/multi-types"
import { cn } from "~/lib/tw"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shad/card"
import { secondsToHMS } from "~/util/presentation/formatting"

export const PGCRMultiTimeline = ({ segments }: { segments: MultiInstanceTimelineSegment[] }) => {
    const { overallStart, overallEnd } = useMemo(() => {
        if (!segments.length) {
            return { overallStart: new Date(0), overallEnd: new Date(0) }
        }
        return {
            overallStart: segments.reduce(
                (min, d) => (d.start < min ? d.start : min),
                segments[0].start
            ),
            overallEnd: segments.reduce((max, d) => (d.end > max ? d.end : max), segments[0].end)
        }
    }, [segments])

    const getRatio = useCallback(
        (date: Date) => {
            const total = overallEnd.getTime() - overallStart.getTime()
            if (total <= 0) return 0
            return (date.getTime() - overallStart.getTime()) / total
        },
        [overallEnd, overallStart]
    )

    const totalDurationSeconds = useMemo(
        () => segments.reduce((s, d) => s + d.duration, 0),
        [segments]
    )
    const totalElapsedSeconds = (overallEnd.getTime() - overallStart.getTime()) / 1000

    if (!segments.length) {
        return null
    }

    return (
        <Card className="gap-0 rounded-none border-0 border-zinc-800 bg-zinc-950 shadow-none">
            <CardHeader className="p-4 pb-2 md:p-6 md:pb-3">
                <CardTitle className="text-base md:text-lg">Session timeline</CardTitle>
                <CardDescription>
                    Total in-activity time: {secondsToHMS(totalDurationSeconds, false)}
                    <br />
                    Total elapsed: {secondsToHMS(totalElapsedSeconds, false)}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
                <div className="bg-muted relative h-4 overflow-hidden">
                    {segments.map((d, i) => {
                        if (!d.start) return null
                        const startPct = getRatio(d.start) * 100
                        const endPct = getRatio(d.end) * 100

                        return (
                            <Link
                                key={d.instanceId}
                                title={[
                                    `Instance #${i + 1}: ${d.instanceId}`,
                                    `${d.activityName}: ${d.versionName}`,
                                    `Started: ${d.start.toLocaleString()}`,
                                    `Ended: ${d.end.toLocaleString()}`,
                                    `Duration: ${secondsToHMS(d.duration, false)}`
                                ].join("\n")}
                                className={cn(
                                    "bg-raidhub/75 absolute top-0 h-full border-x",
                                    d.completed && "bg-green-500"
                                )}
                                style={{
                                    left: `${startPct}%`,
                                    width: `${endPct - startPct}%`
                                }}
                                href={`/pgcr/${d.instanceId}`}
                                target="_blank"
                            />
                        )
                    })}
                </div>
                <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                    <span>{overallStart.toLocaleString()}</span>
                    <span>{overallEnd.toLocaleString()}</span>
                </div>
            </CardContent>
        </Card>
    )
}
