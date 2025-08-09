"use client"

import { useRaidHubInstanceList } from "~/services/raidhub/useRaidHubInstance"
import { MultiInstanceCombinator } from "./multi-combinator"

export const MultiLoader = ({ instances }: { instances: string[] }) => {
    const queries = useRaidHubInstanceList(instances)

    const isLoading = queries.some(q => q.isLoading)

    if (isLoading) {
        const progress = 1 - queries.filter(q => q.isLoading).length / queries.length
        return (
            <div className="mt-2 flex w-full flex-col justify-center gap-1">
                {/* Progress bar shows how many instances have finished loading for the user */}
                <span className="text-primary mb-2 text-lg">
                    Loading data: {Math.round(progress * 100)}%
                </span>
                <div className="relative h-2 w-full rounded bg-gray-200">
                    {/* The filled part represents the percentage of loaded instances */}
                    <div
                        className="bg-raidhub absolute top-0 left-0 h-2 rounded"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>
            </div>
        )
    }
    return <MultiInstanceCombinator data={queries.map(q => q.data!).filter(Boolean)} />
}
