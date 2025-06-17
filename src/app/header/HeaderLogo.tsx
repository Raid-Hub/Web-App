"use client"

import Image from "next/image"
import styled from "styled-components"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { $media } from "~/lib/media"

export const HeaderLogo = () => (
    <Flex $padding={0.2}>
        <Image src="/logo.png" alt="logo" width={35} height={35} />
        <TextLogo>RaidHub</TextLogo>
    </Flex>
)

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
