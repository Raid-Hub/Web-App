/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import styled from "styled-components"
import { Container } from "~/components/layout/Container"
import { Flex } from "~/components/layout/Flex"
import { useClickOutside } from "~/hooks/util/useClickOutside"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"

export const DonationBanner = () => {
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => setIsMounted(true), [])

    const [isWidgetOpen, setIsWidgetOpen] = useState(false)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    const [kofiBannerDismissDate, setKofiBannerDismissDate] = useLocalStorage<string | null>(
        "kofiBannerDismissDate",
        null
    )
    const [kofiBannerNotShown, setKofiBannerNotShown] = useLocalStorage<number>(
        "kofiBannerNotShown",
        0
    )

    // Show the banner every month
    const oneMonthAgo = useMemo(() => {
        const d = new Date()
        d.setUTCMonth(d.getUTCMonth() - 1)
        return d
    }, [])

    const shouldShowBanner =
        isMounted &&
        kofiBannerNotShown > 15 &&
        (kofiBannerDismissDate === null || new Date(kofiBannerDismissDate) < oneMonthAgo)

    useEffect(() => {
        setKofiBannerNotShown(old => old + 1)
    }, [setKofiBannerNotShown, shouldShowBanner])

    useClickOutside(iframeRef, () => setIsWidgetOpen(false), {
        enabled: isWidgetOpen
    })

    return (
        shouldShowBanner && (
            <DonationBannerStyled>
                <p>
                    RaidHub is committed to operating <u>ad-free</u> and remaining free to use. If
                    you enjoy using RaidHub and would like to use the site in the future, please
                    consider supporting us by becoming a member or tipping us on Ko-fi.
                </p>
                <Flex $padding={0}>
                    <button
                        onClick={() => {
                            setIsWidgetOpen(old => !old)
                            setKofiBannerNotShown(0)
                        }}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "0.25rem",
                            backgroundColor: "#ff3b72",
                            color: "white",
                            border: "none",
                            cursor: "pointer"
                        }}>
                        Support RaidHub
                    </button>
                    <button
                        onClick={() => {
                            setKofiBannerDismissDate(new Date().toISOString())
                            setKofiBannerNotShown(0)
                        }}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "0.25rem",
                            backgroundColor: "gray",
                            color: "white",
                            border: "none",
                            cursor: "pointer"
                        }}>
                        Not Today
                    </button>
                </Flex>
                <Suspense>
                    <Flex
                        $fullWidth
                        style={{
                            position: "absolute",
                            zIndex: 5,
                            maxWidth: "100%",
                            left: 0,
                            right: 0
                        }}>
                        <iframe
                            ref={iframeRef}
                            id="kofiframe"
                            src="https://ko-fi.com/raidhub/?hidefeed=true&widget=true&embed=true&preview=true"
                            style={{
                                border: "none",
                                width: "400px",
                                maxWidth: "100%",
                                padding: "4px",
                                background: "#f9f9f9",
                                borderRadius: "10px"
                            }}
                            hidden={!isWidgetOpen}
                            height="712"
                            title="raidhub"></iframe>
                    </Flex>
                </Suspense>
            </DonationBannerStyled>
        )
    )
}

const DonationBannerStyled = styled(Container).attrs({ $fullWidth: true })`
    color: #050505;
    background-color: #f9f9f9bb;
    padding: 0.5rem 1rem;
    letter-spacing: 0.05rem;
    font-weight: 600;
`
