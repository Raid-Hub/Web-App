"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { CloudflareActivitySplash } from "~/components/CloudflareImage"
import { useActivityDisplayParts } from "~/hooks/useActivityDisplayParts"
import { getActivityClusterStats, type ActivityCluster } from "~/lib/activity/sessions"
import { cn } from "~/lib/tw"
import { secondsToHMS } from "~/util/presentation/formatting"
import { ActivityAttemptRow } from "./ActivityAttemptRow"

export const ActivityClusterBlock = ({ cluster }: { cluster: ActivityCluster }) => {
    const stats = getActivityClusterStats(cluster)
    const isMultiAttempt = stats.attempts > 1
    const [expanded, setExpanded] = useState(false)
    const leadActivity = cluster.activities[0]
    const display = useActivityDisplayParts(
        leadActivity ?? {
            activityId: cluster.activityId,
            versionId: cluster.versionId,
            playerCount: 0,
            fresh: null,
            flawless: null,
            isContest: false,
            completed: false
        },
        {
            includeFresh: false,
            pantheonTitleStyle: "boss"
        }
    )

    if (!leadActivity) {
        return null
    }

    if (!isMultiAttempt) {
        return (
            <div className="border-border/40 bg-background/20 overflow-hidden rounded-md border">
                <div className="flex items-center gap-2 border-b px-3 py-2">
                    <ClusterThumb activityId={cluster.activityId} versionId={cluster.versionId} />
                    <span className="truncate text-sm font-medium sm:text-base">
                        {display?.title ?? "Unknown Activity"}
                    </span>
                </div>
                <ActivityAttemptRow activity={leadActivity} />
            </div>
        )
    }

    return (
        <div className="border-border/40 bg-background/20 overflow-hidden rounded-md border">
            <button
                type="button"
                onClick={() => setExpanded(value => !value)}
                className="hover:bg-muted/20 flex w-full items-start gap-3 px-3 py-3 text-left transition-colors">
                <ClusterThumb activityId={cluster.activityId} versionId={cluster.versionId} />
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h5 className="truncate text-sm font-semibold sm:text-base">
                                {display?.title ?? "Unknown Activity"}
                            </h5>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                                {stats.attempts} attempts · {stats.clears} clear
                                {stats.clears === 1 ? "" : "s"}
                                {stats.bestClear
                                    ? ` · best ${secondsToHMS(stats.bestClear.duration, false)}`
                                    : ""}
                            </p>
                        </div>
                        <ChevronDown
                            className={cn(
                                "text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform",
                                expanded && "rotate-180"
                            )}
                        />
                    </div>
                </div>
            </button>

            {expanded && (
                <div className="border-border/40 divide-border/30 divide-y border-t">
                    {cluster.activities.map(activity => (
                        <ActivityAttemptRow key={activity.instanceId} activity={activity} compact />
                    ))}
                </div>
            )}
        </div>
    )
}

const ClusterThumb = ({ activityId, versionId }: { activityId: number; versionId: number }) => (
    <div className="relative size-10 shrink-0 overflow-hidden rounded-md sm:size-11">
        <CloudflareActivitySplash
            activityId={activityId}
            versionId={versionId}
            alt=""
            fill
            className="object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
)
