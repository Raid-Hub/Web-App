"use client"

import { usePGCRContext } from "~/hooks/pgcr/ClientStateManager"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shad/tooltip"

export const PGCRDate = () => {
    const { data } = usePGCRContext()

    const startDate = new Date(data.dateStarted)
    const endDate = new Date(data.dateCompleted)

    const dateString = startDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
    })

    return (
        <div className="flex items-center gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <p className="flex items-center gap-1 text-sm text-zinc-400">{dateString}</p>
                </TooltipTrigger>
                <TimeRangeTooltip startDate={startDate} endDate={endDate} />
            </Tooltip>
        </div>
    )
}

export const TimeRangeTooltip = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
    const tooltipStartTime = startDate.toLocaleString(undefined, {
        timeZoneName: "short"
    })
    const tooltipEndTime = endDate.toLocaleString(undefined, {
        timeZoneName: "short"
    })

    return (
        <TooltipContent side="bottom" align="start">
            <div className="text-xs">
                <p>
                    <strong>Started: </strong>
                    {tooltipStartTime}
                </p>
                <p>
                    <strong>Ended: </strong>
                    {tooltipEndTime}
                </p>
            </div>
        </TooltipContent>
    )
}
