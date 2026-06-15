import { useMemo } from "react"
import { getActivityClusterInstanceIds, mergeClusterGuardians } from "~/lib/activity/guardians"
import { type ActivityCluster } from "~/lib/activity/sessions"
import { useRaidHubInstanceList } from "~/services/raidhub/hooks"

export const useActivityClusterGuardians = (
    cluster: ActivityCluster,
    profileMembershipIds: readonly string[] = []
) => {
    const profileIds = useMemo(() => new Set(profileMembershipIds), [profileMembershipIds])
    const leadActivity = cluster.activities[0]
    const skip = !leadActivity || leadActivity.playerCount > 50

    const instanceIds = useMemo(
        () => getActivityClusterInstanceIds(cluster.activities.map(a => a.instanceId)),
        [cluster.activities]
    )

    const queries = useRaidHubInstanceList(skip ? [] : instanceIds)

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
