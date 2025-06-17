"use client"

import { useMemo } from "react"
import { usePageProps } from "~/components/PageWrapper"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import type { ProfileProps } from "~/lib/profile/types"
import { useProfile } from "~/services/bungie/hooks"
import { CharacterWeeklyProgress } from "./CharacterWeeklyProgress"
export const WeeklyProgress = ({ raid }: { raid: number }) => {
    const { getActivityDefinition } = useRaidHubManifest()
    const { destinyMembershipId, destinyMembershipType } = usePageProps<ProfileProps>()
    const { data: profile } = useProfile(
        {
            destinyMembershipId,
            membershipType: destinyMembershipType
        },
        { staleTime: 3 * 60000 }
    )

    const data = Object.keys(profile?.characters.data ?? {}).length
        ? Object.entries(profile?.characterProgressions?.data ?? {})
        : null

    const state = useMemo(() => {
        const milestone = getActivityDefinition(raid)?.milestoneHash
        if (
            profile &&
            !profile.characterProgressions?.disabled &&
            profile.characterProgressions?.data === undefined
        ) {
            return "No profile data available."
        }

        if (!milestone) {
            return "No milestone data available."
        }
        if (!data) {
            return "No character data available."
        }

        return {
            milestone,
            data
        }
    }, [getActivityDefinition, profile, raid, data])

    return (
        <div className="relative">
            <h4 className="my-2">Weekly Progress</h4>
            {typeof state === "string" ? (
                <div>{state}</div>
            ) : (
                <div className="flex flex-col justify-start gap-2">
                    {state.data.map(
                        ([characterId, { milestones }]) =>
                            profile?.characters.data?.[characterId] &&
                            milestones[Number(state.milestone)] && (
                                <CharacterWeeklyProgress
                                    key={characterId}
                                    character={profile.characters.data[characterId]}
                                    milestone={milestones[Number(state.milestone)]}
                                />
                            )
                    )}
                </div>
            )}
        </div>
    )
}
