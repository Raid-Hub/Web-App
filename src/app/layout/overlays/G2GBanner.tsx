/* eslint-disable @typescript-eslint/no-unused-vars */

"use client"

import { m } from "framer-motion"
import Link from "next/link"
import { useMemo, useState } from "react"
import styled from "styled-components"
import { CloudflareImage } from "~/components/CloudflareImage"
import XSymbol from "~/components/icons/xSymbol"
import { Container } from "~/components/layout/Container"
import { Flex } from "~/components/layout/Flex"
import { useInterval } from "~/hooks/util/useInterval"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"
import { G2GEmblems } from "~/lib/g2g-emblems"
import { o } from "~/util/o"
import { $media } from "../media"

const allG2GEmblems = o.entries(G2GEmblems)

export const G2GBanner = () => {
    const [randomIdx, setRandomIdx] = useState(
        () => 1 + Math.floor(Math.random() * allG2GEmblems.length - 1)
    )

    useInterval(15_000, () => {
        setRandomIdx(old => 1 + ((old + 1) % (allG2GEmblems.length - 1)))
    })

    const [g2gBannerDismissDate, setG2gBannerDismissDate] = useLocalStorage<string | null>(
        "g2g2025BannerDismissDate",
        null
    )

    const dismissedBannerDate = useMemo(
        () => (g2gBannerDismissDate ? new Date(g2gBannerDismissDate) : new Date(0)),
        [g2gBannerDismissDate]
    )

    const oneWeekAgo = useMemo(() => {
        const d = new Date()
        d.setDate(d.getDate() - 7)
        return d
    }, [])

    const shouldShowBanner = dismissedBannerDate < oneWeekAgo

    return (
        shouldShowBanner && (
            <DonationBannerStyled>
                <Flex
                    $wrap
                    $padding={0.5}
                    style={{
                        maxWidth: 1280,
                        columnGap: "2rem",
                        margin: "0 auto"
                    }}>
                    <Container
                        $minHeight={100}
                        $aspectRatio={{
                            width: 1920,
                            height: 590
                        }}
                        as="a"
                        href="https://tiltify.com/bungiefoundation/game2give/game2give-2025"
                        target="_blank"
                        style={{
                            flex: 1
                        }}>
                        <CloudflareImage
                            cloudflareId="g2gBanner"
                            fill
                            priority
                            alt={"Game 2 Give"}
                        />
                    </Container>
                    <div
                        style={{
                            flex: 2,
                            minWidth: 320
                        }}>
                        <p
                            style={{
                                fontWeight: 400
                            }}>
                            This year, RaidHub is raising money for the{" "}
                            <Link href="https://bungiefoundation.org/">Bungie Foundation</Link>.
                            Visit the &quot;donate&quot; page below to see the specific Bungie
                            rewards and incentives available.
                            <br />
                            <br />
                            As a form of gratitude, those who choose to donate through
                            RaidHub&apos;s fundraiser will also be eligible to receive a{" "}
                            <span style={{ color: "#f489ef" }}>shiny RaidHub Profile badge</span> at
                            the end of the event.
                        </p>
                        <Flex $padding={0} $gap={2}>
                            <div className="g2g-banner-emblem">
                                <CloudflareImage
                                    cloudflareId="darkHeroNameplate"
                                    fill
                                    alt="Dark Hero Nameplate"
                                />
                            </div>
                            <Link href="https://tiltify.com/@raidhub/g2g-2025" className="g2g-link">
                                Donate
                            </Link>
                            <m.div
                                key={allG2GEmblems[randomIdx][0]}
                                className="g2g-banner-emblem"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: [
                                        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                                        1, 1, 1, 1, 1, 1, 1, 0
                                    ]
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}>
                                <CloudflareImage
                                    cloudflareId={allG2GEmblems[randomIdx][0]}
                                    fill
                                    alt={allG2GEmblems[randomIdx][0]}
                                />
                            </m.div>
                        </Flex>
                    </div>
                    <button
                        className="g2g-close-button"
                        onClick={() => setG2gBannerDismissDate(new Date().toISOString())}>
                        <XSymbol sx={12} />
                    </button>
                </Flex>
            </DonationBannerStyled>
        )
    )
}

const DonationBannerStyled = styled(Container).attrs({ $fullWidth: true })`
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: color-mix(
        in srgb,
        ${({ theme }) => theme.colors.background.medium},
        #0000 70%
    );
    border: 1px solid ${({ theme }) => theme.colors.border.dark};
    padding: 0.5rem 0.5rem;
    letter-spacing: 0.05rem;
    font-weight: 600;

    ${$media.max.mobile`
        font-size: 0.8rem;
    `}

    .g2g-link {
        color: ${({ theme }) => theme.colors.text.primary};
        font-weight: 600;
        font-size: 1.25rem;
        text-transform: uppercase;
        text-decoration: none;
        cursor: pointer;
        padding: 0.5rem 1rem;
        background-color: blue;

        height: 100%;
    }

    .g2g-banner-emblem {
        aspect-ratio: 474 / 96;
        min-height: 32px;
        flex: 1;
        ${$media.max.tablet`
            display: none;
        `}
        position: relative;
    }

    .g2g-close-button {
        padding: 0.5rem 0.5rem;
        border-radius: 0.25rem;
        color: white;
        border: none;
        cursor: pointer;

        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
    }
`
