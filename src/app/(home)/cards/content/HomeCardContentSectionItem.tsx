"use client"

import Link from "next/link"
import styled from "styled-components"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import RightChevron from "~/components/icons/RightChevron"

export function HomeCardContentSectionItem(props: { title: string; href: string }) {
    return (
        <LinkWrapper href={props.href}>
            <Flex $align="space-between" $padding={0.25}>
                <ContentSectionItemTitle>{props.title}</ContentSectionItemTitle>
                <RightChevron color="orange" sx={24} />
            </Flex>
        </LinkWrapper>
    )
}

const LinkWrapper = styled(Link)`
    min-width: 100%;

    color: ${({ theme }) => theme.colors.text.primary};

    &:hover {
        text-decoration: underline;
        background-color: color-mix(
            in srgb,
            ${({ theme }) => theme.colors.highlight.orange},
            #0000 55%
        );
    }
`

const ContentSectionItemTitle = styled.h5`
    margin-block: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
`
