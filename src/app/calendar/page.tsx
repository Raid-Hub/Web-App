"use client"

import { Collection } from "@discordjs/collection"
import Link from "next/link"
import styled from "styled-components"
import { PageWrapper } from "~/components/PageWrapper"
import { Grid } from "~/components/__deprecated__/layout/Grid"
import { usePublicMilestones } from "~/services/bungie/hooks"
import { FeaturedRaidRotatorEntry, RaidRotatorEntry } from "./RaidRotatorEntry"
import { useIsFeatureableRaidMilestone } from "./hooks/useIsFeatureableRaidMilestone"
import { useRaidRotation } from "./hooks/useRaidRotation"

export default function Page() {
    const isFeatureableRaidMilestone = useIsFeatureableRaidMilestone()
    const {
        data: milestones,
        isLoading,
        isError,
        error
    } = usePublicMilestones({
        select: milestones =>
            new Collection(
                Object.entries(milestones).filter(([hash]) => isFeatureableRaidMilestone(hash))
            ),
        refetchInterval: milestones => {
            if (!milestones) return false
            const now = Date.now()
            const nextReset = milestones.first()?.endDate
            if (!nextReset) return false
            // Refetch 2 minutes after the next reset
            return new Date(nextReset).getTime() - now + 2 * 60 * 1000
        }
    })

    const raidRotation = useRaidRotation(milestones ?? null)

    if (isError) {
        return (
            <PageWrapper>
                <ErrorComponent>{(error as Error).message}</ErrorComponent>
            </PageWrapper>
        )
    }
    if (isLoading) {
        return (
            <PageWrapper>
                <MessageComponent>Loading Weekly Milestones...</MessageComponent>
            </PageWrapper>
        )
    }

    if (!raidRotation) {
        return (
            <PageWrapper>
                <MessageComponent>
                    No featured raids this week. If this doesn&apos;t seem right, please file a bug
                    report in <Link href="https://discord.gg/raidhub">discord.gg/raidhub</Link>
                </MessageComponent>
            </PageWrapper>
        )
    }
    const [currentWeek, ...restOfWeeks] = raidRotation

    return (
        <PageWrapper>
            <Grid $minCardWidth={9999}>
                <FeaturedRaidRotatorEntry
                    defs={currentWeek.grouped}
                    startDate={currentWeek.startDate}
                    endDate={currentWeek.endDate}
                />
                {restOfWeeks.map(({ grouped, startDate, endDate }) => (
                    <RaidRotatorEntry
                        key={startDate.getTime()}
                        defs={grouped}
                        startDate={startDate}
                        endDate={endDate}
                    />
                ))}
            </Grid>
        </PageWrapper>
    )
}

const MessageComponent = styled.div`
    font-size: 1.5rem;
    background-color: color-mix(in srgb, ${({ theme }) => theme.colors.background.dark}, #0000 60%);
    padding: 1em;
    border-radius: 1em;
`

const ErrorComponent = styled.div`
    color: red;
`
