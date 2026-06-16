"use client"

import { usePGCRContext } from "~/hooks/pgcr/ClientStateManager"
import { formatTimeRangeTitle } from "~/lib/pgcr/time-range-title"

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
            <p
                className="flex items-center gap-1 text-sm text-zinc-400"
                title={formatTimeRangeTitle(startDate, endDate)}>
                {dateString}
            </p>
        </div>
    )
}
