"use client"

import { useMemo } from "react"
import { Container } from "~/components/layout/Container"
import { Flex } from "~/components/layout/Flex"
import { usePageProps } from "~/components/layout/PageWrapper"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { H4 } from "~/components/typography/H4"
import { useProfile } from "~/services/bungie/hooks"
import type { ProfileProps } from "../../types"
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
        <Container>
            <H4 style={{ marginBlock: "0.5em" }}>Weekly Progress</H4>
            {typeof state === "string" ? (
                <div>{state}</div>
            ) : (
                <Flex $direction="column" $padding={0} $gap={0.25} $crossAxis="flex-start">
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
                </Flex>
            )}
        </Container>
    )
}
