import Link from "next/link"
import { useCallback } from "react"
import { type CombinedData } from "~/lib/multi/multi-types"
import { cn } from "~/lib/tw"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shad/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shad/tooltip"
import { secondsToHMS } from "~/util/presentation/formatting"

export const MultiDetails = ({ data }: { data: CombinedData }) => {
    const getRatio = useCallback(
        (date: Date) => {
            const total = data.overallEnd.getTime() - data.overallStart.getTime()
            return (date.getTime() - data.overallStart.getTime()) / total
        },
        [data.overallEnd, data.overallStart]
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>
                    Total Playtime: {secondsToHMS(data.duration, false)}
                    <br />
                    Total Elapsed Time:{" "}
                    {secondsToHMS(
                        (data.overallEnd.getTime() - data.overallStart.getTime()) / 1000,
                        false
                    )}
                    <br />
                    {data.completions > 1 && `Completions: ${data.completions}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-muted relative h-4 overflow-hidden">
                    {/* Base filled segments */}
                    {data.instances.map((d, i) => {
                        if (!d.start) return null
                        const startPct = getRatio(d.start) * 100
                        const endPct = getRatio(d.end) * 100

                        return (
                            <Tooltip key={i}>
                                <TooltipTrigger asChild>
                                    <Link
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
                                </TooltipTrigger>
                                <TooltipContent>
                                    <h4 className="font-bold">{`Instance #${i + 1}: ${d.instanceId}`}</h4>
                                    <div className="mb-2 font-semibold">{`${d.activityName}: ${d.versionName}`}</div>
                                    <div>{`Started: ${d.start.toLocaleString()}`}</div>
                                    <div>{`Ended: ${d.end.toLocaleString()}`}</div>
                                    <div>{`Duration: ${secondsToHMS(d.duration, false)}`}</div>
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </div>
                <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                    <span>{data.overallStart.toLocaleString()}</span>
                    <span>{data.overallEnd.toLocaleString()}</span>
                </div>
            </CardContent>
        </Card>
    )
}
