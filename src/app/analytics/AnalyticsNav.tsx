"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import styled, { css } from "styled-components"
import { Flex } from "~/components/__deprecated__/layout/Flex"

const StyledAnalyticsNav = styled(Flex).attrs({
    $padding: 0.5,
    $gap: 0,
    $align: "flex-start"
})`
    a {
        padding: 0.5rem 1rem;
        color: ${({ theme }) => theme.colors.text.primary};

        border: 1px solid ${({ theme }) => theme.colors.border.medium};
    }
`

const StyledLink = styled(Link)<{
    $pathname: string
}>`
    ${({ $pathname, href, theme }) =>
        $pathname === href
            ? css`
                  background-color: ${theme.colors.background.brandDim};
              `
            : css``}
`

export const AnalyticsNav = () => {
    const pathname = usePathname()
    return (
        <StyledAnalyticsNav as="nav">
            <StyledLink href="/analytics/weapon-meta" $pathname={pathname}>
                Weapon Meta
            </StyledLink>
            <StyledLink href="/analytics/player-population" $pathname={pathname}>
                Player Population
            </StyledLink>
        </StyledAnalyticsNav>
    )
}
