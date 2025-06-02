"use client"

import type { DestinyPublicMilestone } from "bungie-net-core/models"
import { type ReactNode } from "react"
import styled from "styled-components"
import { BackgroundImage } from "~/components/BackgroundImage"
import { Flex } from "~/components/layout/Flex"
import { useLocale } from "~/components/providers/LocaleManager"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { H4 } from "~/components/typography/H4"
import { getRaidSplash } from "~/lib/activity-images"
import { type RaidHubActivityDefinition } from "~/services/raidhub/types"
import { RaidActivity } from "./RaidActivity"

export const RaidRotatorEntry = (props: {
    defs: {
        milestone: DestinyPublicMilestone
        activity: RaidHubActivityDefinition
        children?: ReactNode
    }[]
    startDate: Date
    endDate: Date
}) => {
    const { locale } = useLocale()

    return (
        <div>
            <H4>
                {props.startDate.toLocaleDateString(locale, { month: "long", day: "numeric" })}
                {props.startDate.getMonth() === props.endDate.getMonth()
                    ? ` - ${props.endDate.toLocaleDateString(locale, { day: "numeric" })}`
                    : ` - ${props.endDate.toLocaleDateString(locale, {
                          month: "long",
                          day: "numeric"
                      })}`}
            </H4>
            <Flex $wrap $direction="row" $crossAxis="stretch" $padding={0.25}>
                {props.defs.map(def => (
                    <RaidRotatorEntryRaid key={def.activity.id} {...def}></RaidRotatorEntryRaid>
                ))}
            </Flex>
        </div>
    )
}

const RaidRotatorEntryRaid = (props: {
    milestone: DestinyPublicMilestone
    activity: RaidHubActivityDefinition
    children?: ReactNode
}) => {
    const { getDefinitionFromHash } = useRaidHubManifest()

    const activity = getDefinitionFromHash(props.milestone.activities[0].activityHash)?.activity
    const raidName = activity?.name

    if (!raidName) return null

    return (
        <Main>
            <Flex $direction="column" $gap={0.2}>
                <RaidTitle>{raidName}</RaidTitle>
            </Flex>
            {props.children}
            <BackgroundImage
                cloudflareId={getRaidSplash(activity.id) ?? "pantheonSplash"}
                alt={raidName}
                opacity={0.65}
            />
        </Main>
    )
}

export const FeaturedRaidRotatorEntry = (props: {
    defs: {
        milestone: DestinyPublicMilestone
        activity: RaidHubActivityDefinition
    }[]
    startDate: Date
    endDate: Date
}) => {
    const { getDefinitionFromHash } = useRaidHubManifest()
    return (
        <RaidRotatorEntry
            startDate={props.startDate}
            endDate={props.endDate}
            defs={props.defs.map(def => ({
                ...def,
                children: (
                    <Container>
                        <Flex $direction="column" $gap={0.3}>
                            {def.milestone.activities.map(activity => {
                                const definition = getDefinitionFromHash(activity.activityHash)
                                return definition ? (
                                    <RaidActivity
                                        key={activity.activityHash}
                                        activity={activity}
                                        version={definition.version.name}
                                    />
                                ) : null
                            })}
                        </Flex>
                    </Container>
                )
            }))}
        />
    )
}

const Main = styled.div`
    flex: 1;
    flex-basis: 500px;
    position: relative;
    width: 100%;
    background-color: color-mix(in srgb, ${p => p.theme.colors.background.dark}, #0000 50%);

    border: 1px solid color-mix(in srgb, ${p => p.theme.colors.border.dark}, #0000 60%);
`

const Container = styled.div`
    width: 100%;
`

const RaidTitle = styled.h3`
    font-size: 1.5rem;
    margin-block: 0.2em;
`
