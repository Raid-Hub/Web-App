"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import styled from "styled-components"
import { ErrorCard } from "~/components/ErrorCard"
import { Container } from "~/components/layout/Container"
import { Flex } from "~/components/layout/Flex"
import { Grid } from "~/components/layout/Grid"
import { usePageProps } from "~/components/layout/PageWrapper"
import { type RaidHubError } from "~/services/raidhub/RaidHubError"
import { getRaidHubApi } from "~/services/raidhub/common"
import { type RaidHubErrorCode, type RaidHubTeammatesResponse } from "~/services/raidhub/types"
import { Card } from "~/shad/card"
import { bungieProfileIconUrl, getBungieDisplayName } from "~/util/destiny"
import { secondsToYDHMS } from "~/util/presentation/formatting"
import { type ProfileProps } from "../types"

export const Teammates = () => {
    const session = useSession()
    const { destinyMembershipId } = usePageProps<ProfileProps>()

    const teammates = useQuery<RaidHubTeammatesResponse, RaidHubError>({
        queryKey: ["raidhub", "player", destinyMembershipId, "teammates"] as const,
        queryFn: () =>
            getRaidHubApi(
                "/player/{membershipId}/teammates",
                {
                    membershipId: destinyMembershipId
                },
                null,
                {
                    headers: session.data?.raidHubAccessToken?.value
                        ? {
                              Authorization: `Bearer ${session.data?.raidHubAccessToken?.value}`
                          }
                        : {}
                }
            ).then(res => res.response),
        staleTime: Infinity
    })

    if (teammates.isLoading) {
        return <Container>Loading Teammates... This might take a couple of seconds</Container>
    }

    if (teammates.isError) {
        return (
            <Container $fullWidth>
                <ErrorCard>
                    <p>
                        Error loading Teammates: <code>{teammates.error.errorCode}</code>
                    </p>
                    <p>{getErrorMessage(teammates.error.errorCode)}</p>
                </ErrorCard>
            </Container>
        )
    }

    return (
        <Container $fullWidth>
            <Grid>
                {teammates.data.map((teammate, idx) => (
                    <Card key={teammate.playerInfo.membershipId}>
                        <Rank>{idx + 1}</Rank>
                        <Flex $direction="column" $gap={0.25} $padding={0}>
                            <Link
                                href={`/profile/${teammate.playerInfo.membershipId}?tab=classic`}
                                style={{ color: "unset" }}>
                                <Flex $direction="row" $align="flex-start" $gap={1}>
                                    <Image
                                        src={bungieProfileIconUrl(teammate.playerInfo.iconPath)}
                                        alt={getBungieDisplayName(teammate.playerInfo)}
                                        unoptimized
                                        width={48}
                                        height={48}
                                    />
                                    <div>{getBungieDisplayName(teammate.playerInfo)}</div>
                                </Flex>
                            </Link>
                            <Flex
                                $direction="row"
                                $gap={0.5}
                                $paddingY={0.5}
                                $paddingX={1.5}
                                style={{ fontSize: "0.75rem" }}
                                $align="space-around"
                                $fullWidth>
                                <div>
                                    <div>
                                        <b>Clears</b>
                                    </div>
                                    <div>{teammate.clears}</div>
                                </div>
                                <div>
                                    <div>
                                        <b>Instances</b>
                                    </div>
                                    <div>{teammate.instanceCount}</div>
                                </div>
                                <div>
                                    <div>
                                        <b>Duration</b>
                                    </div>
                                    <div>
                                        {secondsToYDHMS(teammate.estimatedTimePlayedSeconds, 3)}
                                    </div>
                                </div>
                            </Flex>
                        </Flex>
                    </Card>
                ))}
            </Grid>
        </Container>
    )
}

const Rank = styled.div`
    position: absolute;
    color: ${props => props.theme.colors.text.secondary};
    top: 5px;
    left: 5px;
`

const getErrorMessage = (errorCode: RaidHubErrorCode) => {
    switch (errorCode) {
        case "PlayerPrivateProfileError":
            return "The owner of this profile has chosen to keep their activity history private. No Peeking!"
        case "PlayerNotFoundError":
            return "This profile does not exist in RaidHub's database."
        default:
            return "An error occurred"
    }
}
