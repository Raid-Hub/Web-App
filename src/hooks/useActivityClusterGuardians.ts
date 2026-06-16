import { useMemo } from "react"
import { getActivityClusterInstanceIds, mergeClusterGuardians } from "~/lib/activity/guardians"
import { type ActivityCluster } from "~/lib/activity/sessions"
import { useRaidHubInstanceList } from "~/services/raidhub/hooks"

export const useActivityClusterGuardians = (
    cluster: ActivityCluster,
    profileMembershipIds: readonly string[] = [],
    opts?: { enabled?: boolean }
) => {
    const profileIds = useMemo(() => new Set(profileMembershipIds), [profileMembershipIds])
    const leadActivity = cluster.activities[0]
    const skip = !leadActivity || leadActivity.playerCount > 50
    const enabled = opts?.enabled ?? true

    const instanceIds = useMemo(() => {
        const ids = getActivityClusterInstanceIds(cluster.activities.map(a => a.instanceId))
        // One instance is enough for teammate chips; avoids N parallel /instance calls per cluster.
        return ids.slice(0, 1)
    }, [cluster.activities])

    const queries = useRaidHubInstanceList(skip || !enabled ? [] : instanceIds)

    return useMemo(() => {
        if (skip) {
            return { guardians: [], isLoading: false, skip: true }
        }

        const isLoading = queries.some(q => q.isLoading)
        const loaded = queries.map(q => q.data).filter((d): d is NonNullable<typeof d> => !!d)

        if (loaded.length === 0) {
            return {
                guardians: isLoading ? null : [],
                isLoading,
                skip: false
            }
        }

        return {
            guardians: mergeClusterGuardians(loaded, profileIds),
            isLoading,
            skip: false
        }
    }, [queries, skip, profileIds])
}
