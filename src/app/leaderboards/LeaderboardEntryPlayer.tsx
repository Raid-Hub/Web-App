"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { type LeaderboardEntryPlayer } from "~/app/leaderboards/LeaderboardEntries"
import { OptionalWrapper } from "~/components/OptionalWrapper"
import { Container } from "~/components/__deprecated__/layout/Container"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { bungieProfileIconUrl } from "~/util/destiny"

export const LeaderboardEntryPlayerComponent = (player: LeaderboardEntryPlayer) => {
    const [icon, setIcon] = useState<string>(player.iconUrl ?? bungieProfileIconUrl(null))
    return (
        <OptionalWrapper
            condition={player.url}
            wrapper={({ children, value }) => (
                <Link
                    style={{ color: "unset" }}
                    href={value}
                    target={value.startsWith("/") ? "" : "_blank"}>
                    {children}
                </Link>
            )}>
            <Flex $align="flex-start" $padding={0.25} style={{ flex: 1 }}>
                <Container
                    $minHeight={25}
                    $aspectRatio={{
                        width: 1,
                        height: 1
                    }}>
                    <Image
                        unoptimized
                        onError={() => setIcon(bungieProfileIconUrl(null))}
                        src={icon}
                        alt={`icon for ${player.displayName}`}
                        fill
                    />
                </Container>
                <span>{player.displayName}</span>
            </Flex>
        </OptionalWrapper>
    )
}
