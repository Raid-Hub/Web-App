"use client"

import type { DestinyPublicMilestoneChallengeActivity } from "bungie-net-core/models"
import styled from "styled-components"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { RaidActivityModifier } from "./RaidActivityModifier"

export const RaidActivity = (props: {
    activity: DestinyPublicMilestoneChallengeActivity
    version: string
}) => (
    <Container>
        <Flex
            $direction="column"
            $padding={0.5}
            $gap={0.2}
            data-activity-hash={props.activity.activityHash}>
            <RaidVersion>{props.version}</RaidVersion>
            <Container>
                <Flex $padding={0.3} $wrap>
                    {props.activity.modifierHashes.map(hash => (
                        <RaidActivityModifier key={hash} hash={hash} />
                    ))}
                </Flex>
            </Container>
        </Flex>
    </Container>
)

const Container = styled.div`
    width: 100%;
`

const RaidVersion = styled.h4`
    font-size: 1.25rem;
    margin-block: 0.2em;
`
