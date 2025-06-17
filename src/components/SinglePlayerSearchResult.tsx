"use client"

import Image from "next/image"
import Link from "next/link"
import styled from "styled-components"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { useLocale } from "~/components/providers/LocaleManager"
import { type RaidHubPlayerInfo } from "~/services/raidhub/types"
import { bungieProfileIconUrl } from "~/util/destiny"
import { getBungieDisplayName } from "~/util/destiny/getBungieDisplayName"
import { formattedTimeSince } from "~/util/presentation/formatting"

export const SinglePlayerSearchResult = (props: {
    size: number
    player: RaidHubPlayerInfo
    noLink?: boolean
    handleSelect?: () => void
}) => {
    const { locale } = useLocale()
    const anchorProps = !props.noLink
        ? {
              href: `/profile/${props.player.membershipId}`,
              as: Link
          }
        : {}
    return (
        <Container $size={props.size} {...anchorProps} onClick={props.handleSelect}>
            <Flex $align="flex-start" $padding={props.size / 2} $gap={props.size / 2} $wrap>
                <Icon
                    src={bungieProfileIconUrl(props.player.iconPath)}
                    alt={getBungieDisplayName(props.player)}
                    unoptimized
                    width={96}
                    height={96}
                    $size={props.size}
                />
                <Flex
                    $direction="column"
                    $padding={0}
                    $gap={props.size / 2}
                    $crossAxis="flex-start">
                    <Username $size={props.size}>{getBungieDisplayName(props.player)}</Username>
                    {props.player.lastSeen && (
                        <LastSeen $size={props.size}>
                            {formattedTimeSince(new Date(props.player.lastSeen), locale)}
                        </LastSeen>
                    )}
                </Flex>
            </Flex>
        </Container>
    )
}

const Container = styled.div<{
    $size: number
}>`
    cursor: pointer;
    padding: ${({ $size }) => $size * 0.25}em;
    &:hover {
        background-color: color-mix(
            in srgb,
            ${({ theme }) => theme.colors.highlight.orange},
            #0000 40%
        );
    }
`

const Icon = styled(Image)<{
    $size: number
}>`
    border-radius: ${({ $size }) => $size}px;

    width: ${({ $size }) => $size * 32}px;
    height: ${({ $size }) => $size * 32}px;
`

const Username = styled.span<{
    $size: number
}>`
    font-size: ${({ $size }) => 0.4 + $size * 0.4}rem;

    color: ${({ theme }) => theme.colors.text.primary};
`

const LastSeen = styled.span<{
    $size: number
}>`
    font-size: ${({ $size }) => 0.2 + $size * 0.4}rem;

    color: ${({ theme }) => theme.colors.text.secondary};
`
