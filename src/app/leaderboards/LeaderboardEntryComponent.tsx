"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef } from "react"
import styled from "styled-components"
import { OptionalWrapper } from "~/components/OptionalWrapper"
import { Panel } from "~/components/__deprecated__/Panel"
import { Container } from "~/components/__deprecated__/layout/Container"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { Grid } from "~/components/__deprecated__/layout/Grid"
import { useLocale } from "~/components/providers/LocaleManager"
import { MobileDesktopSwitch } from "~/components/util/MobileDesktopSwitch"
import { useQueryParams } from "~/hooks/util/useQueryParams"
import { $media } from "~/lib/media"
import { formattedNumber, secondsToHMS, truncatedNumber } from "../../util/presentation/formatting"
import { type LeaderboardEntry } from "./LeaderboardEntries"
import { LeaderboardEntryPlayerComponent } from "./LeaderboardEntryPlayer"

export const LeaderboardEntryComponent = ({
    placementIcon,
    isTargetted,
    valueFormat,
    ...entry
}: LeaderboardEntry & {
    isTargetted: boolean
    placementIcon?: JSX.Element
}) => {
    const { remove } = useQueryParams<{
        position: string
    }>()
    const { locale } = useLocale()
    const value =
        valueFormat === "duration"
            ? secondsToHMS(entry.value, true)
            : formattedNumber(entry.value, locale, 3)

    const lg = useRef<HTMLDivElement>(null)
    const sm = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isTargetted) {
            if (lg.current && lg.current.getBoundingClientRect().width > 0) {
                lg.current.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "center"
                })
            } else if (sm.current && sm.current.getBoundingClientRect().width > 0) {
                sm.current.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "center"
                })
            }
        }
    }, [isTargetted, remove])

    const targettedStyle = useMemo(
        () =>
            isTargetted
                ? {
                      border: "2px solid orange"
                  }
                : undefined,
        [isTargetted]
    )

    return (
        <MobileDesktopSwitch
            sm={
                <Panel $fullWidth ref={sm} style={targettedStyle}>
                    <Flex $gap={2} $padding={0.5}>
                        <Container $flex style={{ fontSize: "1.375rem", minWidth: "20px" }}>
                            {placementIcon ?? truncatedNumber(entry.rank, locale)}
                        </Container>
                        <OptionalWrapper
                            condition={entry.url}
                            wrapper={({ children, value }) => (
                                <Link
                                    style={{ color: "unset" }}
                                    href={value}
                                    target={value.startsWith("/") ? "" : "_blank"}>
                                    {children}
                                </Link>
                            )}>
                            <Value>{value}</Value>
                        </OptionalWrapper>
                    </Flex>
                    <Flex $padding={0.5}>
                        {entry.type === "player" ? (
                            <LeaderboardEntryPlayerComponent {...entry.player} />
                        ) : (
                            <Grid $numCols={1} $fullWidth>
                                {entry.team.map(player => (
                                    <LeaderboardEntryPlayerComponent key={player.id} {...player} />
                                ))}
                            </Grid>
                        )}
                    </Flex>
                </Panel>
            }
            lg={
                <Panel
                    ref={lg}
                    $maxWidth={entry.type === "player" ? 450 : undefined}
                    $fullWidth
                    $growOnHover
                    style={targettedStyle}>
                    <Flex $align={"space-between"}>
                        <Flex style={{ flex: 1 }} $padding={0} $align="flex-start">
                            <Container
                                $flex
                                style={{
                                    fontSize: "1.375rem",
                                    minWidth: "10%"
                                }}>
                                {placementIcon ?? truncatedNumber(entry.rank, locale)}
                            </Container>
                            {entry.type === "team" ? (
                                <Grid $minCardWidth={190} $fullWidth>
                                    {entry.team.map(player => (
                                        <LeaderboardEntryPlayerComponent
                                            key={player.id}
                                            {...player}
                                        />
                                    ))}
                                </Grid>
                            ) : (
                                <LeaderboardEntryPlayerComponent {...entry.player} />
                            )}
                        </Flex>
                        <OptionalWrapper
                            condition={entry.url}
                            wrapper={({ children, value }) => (
                                <Link
                                    style={{ color: "unset" }}
                                    href={value}
                                    target={value.startsWith("/") ? "" : "_blank"}>
                                    {children}
                                </Link>
                            )}>
                            <Value>{value}</Value>
                        </OptionalWrapper>
                    </Flex>
                </Panel>
            }
        />
    )
}

const Value = styled.span`
    white-space: nowrap;
    font-size: 1.375rem;
    ${$media.max.mobile`
        font-size: 1.125rem;
    `}
    color: ${({ theme }) => theme.colors.text.secondary};
`
