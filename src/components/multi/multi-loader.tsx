"use client"

import PGCR from "~/components/pgcr/pgcr-view"
import { mergeRaidHubInstances } from "~/lib/multi/merge-instances"
import { useRaidHubInstanceList } from "~/services/raidhub/useRaidHubInstance"

export const MultiLoader = ({
    multiId,
    instances
}: {
    multiId: string
    instances: string[]
}) => {
    const queries = useRaidHubInstanceList(instances)

    const isLoading = queries.some(q => q.isLoading)

    if (isLoading) {
        const progress = 1 - queries.filter(q => q.isLoading).length / queries.length
        return (
            <div className="mt-2 flex w-full flex-col justify-center gap-1">
                <span className="text-primary mb-2 text-lg">
                    Loading data: {Math.round(progress * 100)}%
                </span>
                <div className="relative h-2 w-full rounded bg-gray-200">
                    <div
                        className="bg-raidhub absolute top-0 left-0 h-2 rounded"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>
            </div>
        )
    }

    const loaded = queries.map(q => q.data).filter((d): d is NonNullable<typeof d> => !!d)
    if (loaded.length === 0) {
        return <p className="text-muted-foreground mt-4">Could not load instance data.</p>
    }

    const mergedMulti = loaded.length > 1
    const { merged, timeline } = mergedMulti
        ? mergeRaidHubInstances(loaded, multiId)
        : { merged: loaded[0], timeline: undefined }

    return (
        <PGCR
            data={merged}
            sortScoreOptions={mergedMulti ? { capTPS: false } : undefined}
            multiTimeline={mergedMulti ? timeline : undefined}
            allowsReporting={!mergedMulti}
        />
    )
}
