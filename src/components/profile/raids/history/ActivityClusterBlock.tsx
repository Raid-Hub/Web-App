"use client"

import { ChevronDown } from "lucide-react"

import { useState } from "react"

import { CloudflareActivitySplash } from "~/components/CloudflareImage"

import { useActivityDisplayParts } from "~/hooks/useActivityDisplayParts"

import { getActivityClusterStats, type ActivityCluster } from "~/lib/activity/sessions"

import { cn } from "~/lib/tw"

import { Badge } from "~/shad/badge"

import { secondsToHMS } from "~/util/presentation/formatting"

import { ActivityAttemptRow } from "./ActivityAttemptRow"

import { ClusterGuardians } from "./ClusterGuardians"

export const ActivityClusterBlock = ({
    cluster,

    profileMembershipIds
}: {
    cluster: ActivityCluster

    profileMembershipIds: readonly string[]
}) => {
    const stats = getActivityClusterStats(cluster)

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

    return (
        <div className="border-border/50 bg-muted/15 ring-border/30 overflow-hidden rounded-lg border shadow-sm ring-1 backdrop-blur-md">
            <button
                type="button"
                onClick={() => setExpanded(value => !value)}
                className="hover:bg-muted/25 focus-visible:ring-ring/60 flex w-full items-start gap-3 px-3 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none">
                <ClusterThumb activityId={cluster.activityId} versionId={cluster.versionId} />

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <h5 className="truncate text-sm font-semibold tracking-tight sm:text-base">
                                    {display?.title ?? "Unknown Activity"}
                                </h5>

                                {display?.versionLabel && (
                                    <Badge
                                        variant="outline"
                                        className="border-border/60 bg-background/40 text-foreground h-5 shrink-0 px-1.5 py-0 text-[10px] font-medium backdrop-blur-sm">
                                        {display.versionLabel}
                                    </Badge>
                                )}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <ClusterStatPill label="attempts" value={stats.attempts} />

                                <ClusterStatPill label="clears" value={stats.clears} />

                                {stats.bestClear && (
                                    <ClusterStatPill
                                        label="best"
                                        value={secondsToHMS(stats.bestClear.duration, false)}
                                    />
                                )}
                            </div>

                            <ClusterGuardians
                                cluster={cluster}
                                profileMembershipIds={profileMembershipIds}
                                className="mt-2.5"
                            />
                        </div>

                        <ChevronDown
                            className={cn(
                                "text-muted-foreground mt-1 size-4 shrink-0 transition-transform duration-200",

                                expanded && "rotate-180"
                            )}
                        />
                    </div>
                </div>
            </button>

            {expanded && (
                <div className="border-border/40 divide-border/25 divide-y border-t bg-black/20 backdrop-blur-sm">
                    {cluster.activities.map(activity => (
                        <ActivityAttemptRow key={activity.instanceId} activity={activity} compact />
                    ))}
                </div>
            )}
        </div>
    )
}

const ClusterStatPill = ({ label, value }: { label: string; value: string | number }) => (
    <span className="border-border/40 bg-background/30 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs tabular-nums backdrop-blur-sm sm:text-sm">
        <span className="text-muted-foreground">{label}</span>

        <span className="text-foreground font-medium">{value}</span>
    </span>
)

const ClusterThumb = ({ activityId, versionId }: { activityId: number; versionId: number }) => (
    <div className="ring-border/40 relative size-11 shrink-0 overflow-hidden rounded-lg ring-1 sm:size-12">
        <CloudflareActivitySplash
            activityId={activityId}
            versionId={versionId}
            alt=""
            fill
            className="object-cover brightness-[0.85]"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/55" />
    </div>
)
