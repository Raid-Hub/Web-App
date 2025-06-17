"use client"

import { type Collection } from "@discordjs/collection"
import { type DestinyPublicMilestone } from "bungie-net-core/models"
import { useMemo } from "react"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { type RaidHubActivityDefinition } from "~/services/raidhub/types"
import { modulo } from "~/util/math"
import { useSeasonEndDate } from "./useSeasonEndDate"

export const useRaidRotation = (milestones: Collection<string, DestinyPublicMilestone> | null) => {
    const { getDefinitionFromHash, getActivityDefinition, activeRaids } = useRaidHubManifest()
    const seasonEndDate = useSeasonEndDate()

    return useMemo(() => {
        if (!milestones || !seasonEndDate || seasonEndDate.getTime() <= Date.now()) return null

        const thisWeeksMilestones =
            milestones.filter(milestone =>
                milestone.activities.some(
                    a =>
                        // Apparently the raid milestone is the only one with challengeObjectiveHashes
                        a.challengeObjectiveHashes.length
                )
            ) ?? null

        if (!thisWeeksMilestones?.size) return null

        const thisWeeksRaids =
            thisWeeksMilestones?.map(milestone => ({
                milestone,
                activity: getDefinitionFromHash(milestone.activities[0].activityHash)!.activity
            })) ?? null

        const alreadyFeaturedRotation = new Set<string>()
        const orderedMilestones = new Array<
            {
                milestone: DestinyPublicMilestone
                activity: RaidHubActivityDefinition
            }[]
        >()

        const featurableRaids = activeRaids.slice(1) // Filter out the current newest raid
        let pointers = thisWeeksRaids
            .map(def => featurableRaids.indexOf(def.activity.id))
            .sort((a, b) => b - a)
        const hashedPointers = () => pointers.join()

        while (!alreadyFeaturedRotation.has(hashedPointers())) {
            alreadyFeaturedRotation.add(hashedPointers())
            orderedMilestones.push(
                pointers.map(p => {
                    return {
                        milestone: milestones.find(
                            m =>
                                getDefinitionFromHash(m.activities[0].activityHash)!.activity.id ===
                                featurableRaids[p]
                        )!,
                        activity: getActivityDefinition(featurableRaids[p])!
                    }
                })
            )
            pointers = pointers
                .map(listedIdx => modulo(listedIdx - 1, featurableRaids.length))
                .sort((a, b) => b - a)
        }

        const weekStartDate = new Date(thisWeeksMilestones.first()!.startDate!)
        const weekEndDate = new Date(thisWeeksMilestones.first()!.endDate!)

        return Array.from(
            { length: Math.ceil((seasonEndDate.getTime() - Date.now()) / 604800000) },
            (_, idx) => {
                const milestoneStartDate = new Date(weekStartDate.getTime() + 604800000 * idx)
                const milestoneEndDate = new Date(weekEndDate.getTime() + 604800000 * idx)

                return {
                    grouped: orderedMilestones[idx % orderedMilestones.length],
                    startDate: milestoneStartDate,
                    endDate: milestoneEndDate
                }
            }
        )
    }, [milestones, seasonEndDate, activeRaids, getDefinitionFromHash, getActivityDefinition])
}
