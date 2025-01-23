"use client"

import Link from "next/link"
import { type ReactNode } from "react"
import styled from "styled-components"
import { type SVGComponent } from "~/components/SVG"
import DiscordIcon from "~/components/icons/DiscordIcon"
import Email from "~/components/icons/Email"
import KofiIcon from "~/components/icons/Kofi"
import TwitterIcon from "~/components/icons/TwitterIcon"
import { Flex } from "~/components/layout/Flex"

let version = ""
switch (process.env.APP_ENV) {
    case "local":
        version = "local"
        break
    case "preview":
        version = `preview-${process.env.APP_VERSION}`
        break
    case "staging":
        version = `staging-${process.env.APP_VERSION}`
        break
    case "production":
        version = `${process.env.APP_VERSION}`
        break
    default:
        version = "unknown"
}

const contactIcons: { url: string; Icon: SVGComponent }[] = [
    {
        url: "https://ko-fi.com/raidhub",
        Icon: KofiIcon
    },
    {
        url: `https://discord.gg/raidhub`,
        Icon: DiscordIcon
    },
    {
        url: "https://www.twitter.com/raidhubio",
        Icon: TwitterIcon
    },
    {
        url: `mailto:admin@raidhub.io`,
        Icon: Email
    }
]

export const Footer = () => {
    return (
        <FooterStyled id="footer">
            <Flex $align="space-between" $padding={1}>
                <FooterSide side="left">
                    <div>
                        Developed by <Developer href={`/newo`}>{"Newo"}</Developer>
                    </div>
                    <div>
                        RaidHub <Version>{version}</Version>
                    </div>
                </FooterSide>
                <FooterSide side="right">
                    <Flex $padding={0}>
                        {contactIcons.map(({ url, Icon }, key) => (
                            <Link key={key} href={url} target="_blank" rel="noopener noreferrer">
                                <Icon sx={30} color="gray" hoverColor="lightGray" />
                            </Link>
                        ))}
                    </Flex>
                    <Flex $padding={0} $gap={0.35}>
                        <Link href="/privacy">Privacy</Link>
                        <Link href="/terms">Terms</Link>
                    </Flex>
                </FooterSide>
            </Flex>
        </FooterStyled>
    )
}

const FooterStyled = styled.footer`
    overflow: hidden;
    margin-top: auto;
    min-width: 100%;

    background-color: color-mix(in srgb, ${({ theme }) => theme.colors.background.dark}, #0000 50%);

    backdrop-filter: blur(10px);
    border-top: 1px solid color-mix(in srgb, ${({ theme }) => theme.colors.border.dark}, #0000 60%);
    border-bottom: 1px solid
        color-mix(in srgb, ${({ theme }) => theme.colors.border.dark}, #0000 60%);

    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.tertiary};

    & a {
        color: ${({ theme }) => theme.colors.text.tertiary};
        &:hover {
            color: ${({ theme }) => theme.colors.text.secondary};
        }
    }
`

const FooterSide = (props: { children: ReactNode; side: "left" | "right" }) => (
    <Flex
        $direction="column"
        $align="space-between"
        $padding={0}
        $gap={0.9}
        $crossAxis={props.side === "left" ? "flex-start" : "flex-end"}>
        {props.children}
    </Flex>
)

const Developer = styled(Link)`
    font-weight: 800;
    text-transform: uppercase;
`

const Version = styled.span`
    color: ${({ theme }) => theme.colors.text.secondary};
`
