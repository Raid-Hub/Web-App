"use client"

import { useActivityClusterGuardians } from "~/hooks/useActivityClusterGuardians"
import { CLUSTER_GUARDIAN_DISPLAY_LIMIT } from "~/lib/activity/guardians"
import { type ActivityCluster } from "~/lib/activity/sessions"
import { cn } from "~/lib/tw"
import { GuardianChip } from "./GuardianChip"

export const ClusterGuardians = ({
    cluster,
    profileMembershipIds,
    className
}: {
    cluster: ActivityCluster
    profileMembershipIds: readonly string[]
    className?: string
}) => {
    const { guardians, isLoading, skip } = useActivityClusterGuardians(
        cluster,
        profileMembershipIds
    )

    const teammates = guardians?.filter(guardian => !guardian.isProfilePlayer) ?? []

    if (skip || isLoading || teammates.length === 0) {
        return null
    }

    const visible = teammates.slice(0, CLUSTER_GUARDIAN_DISPLAY_LIMIT)
    const overflow = teammates.length - visible.length

    return (
        <div className={cn("flex min-w-0 flex-wrap items-center gap-1.5", className)}>
            {visible.map(guardian => (
                <GuardianChip key={guardian.playerInfo.membershipId} guardian={guardian} />
            ))}
            {overflow > 0 && (
                <span className="border-border/40 bg-background/25 text-muted-foreground inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs tabular-nums backdrop-blur-sm">
                    +{overflow}
                </span>
            )}
        </div>
    )
}
