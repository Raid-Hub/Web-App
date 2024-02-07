"use client"

import Image from "next/image"
import Link from "next/link"
import styled from "styled-components"
import { BackdropBlur } from "~/components/BackdropBlur"
import { Flex } from "~/components/layout/Flex"
import { $media } from "../managers/StyledComponentsManager"
import { AccountIcon } from "./AccountIcon"
import { SearchBar } from "./SearchBar"

export const Header = () => {
    return (
        <StyledHeader id="header">
            <Flex $align="space-between" $padding={0.3}>
                <Link href="/">
                    <Flex $padding={0.2}>
                        <Image src="/logo.png" alt="logo" width={35} height={35} />
                        <TextLogo>RaidHub</TextLogo>
                    </Flex>
                </Link>
                <Flex $padding={0.2}>
                    <SearchBar />
                    <AccountIcon />
                </Flex>
            </Flex>
            <BackdropBlur $radius={8} />
        </StyledHeader>
    )
}

const StyledHeader = styled.header`
    position: sticky;
    top: 0;
    z-index: 100;

    min-width: 100%;
    padding: 0.2em;

    background-color: color-mix(in srgb, ${({ theme }) => theme.colors.background.dark}, #0000 85%);

    border-top: 1px solid ${({ theme }) => theme.colors.border.dark};

    border-bottom: 1px solid
        color-mix(in srgb, ${({ theme }) => theme.colors.border.dark}, #0000 60%);
`

const TextLogo = styled.span`
    font-family: "Inter", sans-serif;
    text-transform: uppercase;
    color: white;
    letter-spacing: 2px;
    font-size: 1.25rem;
    white-space: nowrap;
    font-weight: 800;

    ${$media.max.mobile`
        display: none;
    `}
`
