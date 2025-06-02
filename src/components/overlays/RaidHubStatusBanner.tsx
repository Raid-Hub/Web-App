"use client"

import Link from "next/link"
import { useMemo } from "react"
import styled from "styled-components"
import { Container } from "~/components/layout/Container"
import { useLocale } from "~/components/providers/LocaleManager"
import { useRaidHubStatus } from "~/services/raidhub/useRaidHubStatus"
import { round } from "~/util/math"
import { formattedTimeSince, secondsToString } from "~/util/presentation/formatting"

type AtlasState =
    | {
          status: "loading"
      }
    | {
          status: "ok"
          lagSeconds: number
      }
    | {
          status: "paused"
          lastCompletedDate: Date
      }
    | {
          status: "warn"
          lagSeconds: number
          lastCompletedDate: Date
          estimatedCatchupDate: Date | null
      }
    | {
          status: "alert"
          lastCompletedDate: Date
          reason: string
      }
    | {
          status: "error"
          reason: string
      }

type FloodgatesState =
    | {
          status: "loading"
      }
    | {
          status: "ok"
      }
    | {
          status: "closed"
          backlogSize: number
          incomingRate: number
      }
    | {
          status: "emptying"
          backlogSize: number
          resolveRate: number
          incomingRate: number
          estimatedCatchupDate: Date | null
      }
    | {
          status: "emptying2"
          backlogSize: number
          incomingRate: number
          resolveRate: number
          estimatedCatchupDate: Date | null
          currentLag: number
          lastCompletedDate: Date
      }
    | {
          status: "error"
          reason: string
      }

export const RaidHubStatusBanner = () => {
    const statusQuery = useRaidHubStatus()

    const atlasStatus = useMemo((): AtlasState => {
        if (statusQuery.isLoading) return { status: "loading" }
        if (statusQuery.isError) return { status: "error", reason: statusQuery.error.message }

        const atlas = statusQuery.data.AtlasPGCR

        switch (atlas.status) {
            case "Crawling":
                if (!atlas.medianSecondsBehindNow) {
                    return {
                        status: "error",
                        reason: "Invalid API response"
                    }
                } else if (atlas.medianSecondsBehindNow < 60) {
                    return {
                        status: "ok",
                        lagSeconds: atlas.medianSecondsBehindNow
                    }
                } else {
                    return {
                        status: "warn",
                        lagSeconds: atlas.medianSecondsBehindNow,
                        lastCompletedDate: new Date(atlas.latestResolvedInstance.dateCompleted),
                        estimatedCatchupDate: atlas.estimatedCatchUpTimestamp
                            ? new Date(atlas.estimatedCatchUpTimestamp)
                            : null
                    }
                }
            case "Idle":
                return {
                    status: "paused",
                    lastCompletedDate: new Date(atlas.latestResolvedInstance.dateCompleted)
                }
            case "Offline":
                return {
                    status: "alert",
                    lastCompletedDate: new Date(atlas.latestResolvedInstance.dateCompleted),
                    reason: "Crawler Offline"
                }
            default:
                return {
                    status: "error",
                    reason: "Unknown Atlas state"
                }
        }
    }, [statusQuery])

    const floodgatesStatus = useMemo((): FloodgatesState => {
        if (statusQuery.isLoading) return { status: "loading" }
        if (statusQuery.isError) return { status: "error", reason: statusQuery.error.message }

        const floodgates = statusQuery.data.FloodgatesPGCR

        switch (floodgates.status) {
            case "Empty":
            case "Live":
                return {
                    status: "ok"
                }
            case "Blocked":
                return {
                    status: "closed",
                    backlogSize: floodgates.backlog,
                    incomingRate: floodgates.incomingRate
                }
            case "Crawling":
                if (!floodgates.latestResolvedInstance) {
                    return {
                        status: "emptying",
                        backlogSize: floodgates.backlog,
                        resolveRate: floodgates.resolveRate,
                        incomingRate: floodgates.incomingRate,
                        estimatedCatchupDate: floodgates.estimatedBacklogEmptied
                            ? new Date(floodgates.estimatedBacklogEmptied)
                            : null
                    }
                } else {
                    return {
                        status: "emptying2",
                        backlogSize: floodgates.backlog,
                        incomingRate: floodgates.incomingRate,
                        resolveRate: floodgates.resolveRate,
                        estimatedCatchupDate: floodgates.estimatedBacklogEmptied
                            ? new Date(floodgates.estimatedBacklogEmptied)
                            : null,
                        currentLag:
                            (new Date(floodgates.latestResolvedInstance.dateResolved).getTime() -
                                new Date(
                                    floodgates.latestResolvedInstance.dateCompleted
                                ).getTime()) /
                            1000,
                        lastCompletedDate: new Date(floodgates.latestResolvedInstance.dateCompleted)
                    }
                }
            default:
                return {
                    status: "error",
                    reason: "Unknown Floodgates state"
                }
        }
    }, [statusQuery])

    return (
        <Container $fullWidth>
            <RaidHubAtlasBannerInner {...atlasStatus} />
            {atlasStatus.status !== "error" && (
                <RaidHubFloodgatesBannerInner {...floodgatesStatus} />
            )}
        </Container>
    )
}

const RaidHubAtlasBannerInner = (state: AtlasState) => {
    const { locale } = useLocale()
    switch (state.status) {
        case "ok":
        case "loading":
            return null
        case "paused":
            return (
                <StyledRaidHubStatsBanner $alertLevel="warn">
                    {`RaidHub activity crawling is currently paused. Latest activity crawled at: `}
                    <b>
                        {state.lastCompletedDate.toLocaleString(locale, {
                            timeZoneName: "short"
                        })}
                    </b>
                </StyledRaidHubStatsBanner>
            )
        case "warn":
            return (
                <StyledRaidHubStatsBanner $alertLevel="warn">
                    {`Warning: RaidHub activity crawling has fallen behind. Activites are currently delayed by `}
                    <b>{secondsToString(state.lagSeconds)}</b>
                    {`. `}
                    {state.estimatedCatchupDate &&
                        state.estimatedCatchupDate.getTime() > Date.now() && (
                            <>
                                {`We expect this issue to be resolved by `}
                                <b>
                                    {state.estimatedCatchupDate.toLocaleTimeString(locale, {
                                        timeZoneName: "short",
                                        hour: "numeric",
                                        minute: "numeric"
                                    })}
                                </b>
                                {` (${formattedTimeSince(state.estimatedCatchupDate)}).`}
                            </>
                        )}

                    {`We apologize for the inconvenience.`}
                </StyledRaidHubStatsBanner>
            )
        case "alert":
            return (
                <StyledRaidHubStatsBanner $alertLevel="alert">
                    {`Alert: No new activities are currently being added (${state.reason}). Latest activity crawled at: `}
                    <b>
                        {state.lastCompletedDate.toLocaleString(locale, {
                            timeZoneName: "short"
                        })}
                    </b>
                    {`. We apologize for the inconvenience and are working to resolve the issue.`}
                </StyledRaidHubStatsBanner>
            )
        case "error":
            return (
                <StyledRaidHubStatsBanner $alertLevel="error">
                    {`An error occurred while checking RaidHub's status: ${state.reason}. Activity crawling may be paused. Please let us know in our `}
                    <Link
                        href="https://discord.gg/raidhub"
                        style={{
                            color: "unset",
                            textDecoration: "underline"
                        }}>
                        Discord server
                    </Link>
                    {` if you continue to experience issues.`}
                </StyledRaidHubStatsBanner>
            )
    }
}

const RaidHubFloodgatesBannerInner = (state: FloodgatesState) => {
    const { locale } = useLocale()
    switch (state.status) {
        case "ok":
        case "loading":
            return null
        case "closed":
            return (
                <StyledRaidHubStatsBanner $alertLevel="warn">
                    <p className="mb-2">
                        Warning: Some PGCRs are currently being withheld/redacted by Bungie. This is
                        normal and expected. They will become available when Bungie unblocks them in
                        the API.
                    </p>
                    <p>
                        The backlog size is currently{" "}
                        <strong>{state.backlogSize.toLocaleString()}</strong> with an additional{" "}
                        <strong>
                            {round(state.incomingRate * 60, 0).toLocaleString()} instances coming in
                            every minute.
                        </strong>
                    </p>
                </StyledRaidHubStatsBanner>
            )
        case "emptying":
            return (
                <StyledRaidHubStatsBanner $alertLevel="warn">
                    <p>
                        Warning: Bungie recently unredacted a batch of PGCRs. We are currently
                        processing a backlog of{" "}
                        <strong>{state.backlogSize.toLocaleString()} instances</strong> at a rate of{" "}
                        <strong>
                            {round(state.resolveRate * 60, 0).toLocaleString()} instances per
                            minute.
                        </strong>
                        {state.estimatedCatchupDate && (
                            <>
                                {" "}
                                We expect to be fully caught up by{" "}
                                <b>
                                    {state.estimatedCatchupDate?.toLocaleTimeString(locale, {
                                        timeZoneName: "short",
                                        hour: "numeric",
                                        minute: "numeric"
                                    })}
                                </b>{" "}
                                ({formattedTimeSince(state.estimatedCatchupDate)})
                            </>
                        )}
                    </p>
                </StyledRaidHubStatsBanner>
            )
        case "emptying2":
            return (
                <StyledRaidHubStatsBanner $alertLevel="warn">
                    <p>
                        Warning: Bungie recently unredacted a batch of PGCRs. We are currently
                        processing a backlog of{" "}
                        <strong>{state.backlogSize.toLocaleString()} instances</strong> at a rate of{" "}
                        <strong>
                            {round(state.resolveRate * 60, 0).toLocaleString()} instances per
                            minute.
                        </strong>{" "}
                        The most recent activity crawled was terminated at{" "}
                        <strong>
                            {state.lastCompletedDate.toLocaleTimeString(locale, {
                                timeZoneName: "short"
                            })}
                            .
                        </strong>
                        {state.estimatedCatchupDate && (
                            <>
                                {" "}
                                We expect to be fully caught up by{" "}
                                <b>
                                    {state.estimatedCatchupDate?.toLocaleTimeString(locale, {
                                        timeZoneName: "short",
                                        hour: "numeric",
                                        minute: "numeric"
                                    })}
                                </b>{" "}
                                ({formattedTimeSince(state.estimatedCatchupDate)})
                            </>
                        )}
                    </p>
                </StyledRaidHubStatsBanner>
            )
    }
}

const StyledRaidHubStatsBanner = styled.div<{
    $alertLevel: "info" | "warn" | "alert" | "error"
}>`
    background-color: ${props => {
        switch (props.$alertLevel) {
            case "info":
                return props.theme.colors.background.info
            case "warn":
                return props.theme.colors.background.warning
            case "alert":
                return props.theme.colors.background.error
            case "error":
                return props.theme.colors.background.error
        }
    }};
    letter-spacing: 0.2px;
    color: ${props => (props.$alertLevel === "warn" ? "black" : props.theme.colors.text.white)};
    padding: 0.5rem;
`
