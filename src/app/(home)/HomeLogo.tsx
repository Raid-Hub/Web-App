"use client"

import Image from "next/image"
import styled from "styled-components"
import { $media } from "~/lib/media"

export const HomeLogo = () => {
    return (
        <div className="flex h-24 items-center justify-center lg:h-32 2xl:h-40">
            <Image
                src="/logo.png"
                alt=""
                className="absolute left-1/2 size-24 -translate-x-1/2 opacity-10 lg:size-32 2xl:size-40"
                width={70}
                height={70}
            />
            <TextLogo>
                Raid<TextLogoGlow>Hub</TextLogoGlow>
            </TextLogo>
        </div>
    )
}

const TextLogo = styled.h1`
    font-family: "Inter", sans-serif;
    text-transform: uppercase;
    letter-spacing: 3px;
    font-size: 4rem;
    font-weight: 800;
    color: ${props => props.theme.colors.text.white};
    white-space: nowrap;

    ${$media.max.tablet`
        font-size: 3rem;
    `}

    ${$media.max.mobile`
        font-size: 2rem;
    `}

    ${$media.max.tiny`
        font-size: 1.5rem;
    `}
`

const TextLogoGlow = styled.span`
    color: ${props => props.theme.colors.brand.primary};
    text-shadow: 0 0 3rem ${props => props.theme.colors.brand.primary};
`
