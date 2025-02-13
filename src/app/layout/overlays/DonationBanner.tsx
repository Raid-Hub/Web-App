/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { AnimatePresence, m } from "framer-motion"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import styled from "styled-components"
import { Flex } from "~/components/layout/Flex"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"
import { $media } from "../media"

export const DonationBanner = () => {
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => setIsMounted(true), [])

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
        kofiBannerNotShown > 25 &&
        (kofiBannerDismissDate === null || new Date(kofiBannerDismissDate) < oneMonthAgo)

    useEffect(() => {
        setKofiBannerNotShown(old => old + 1)
    }, [setKofiBannerNotShown, shouldShowBanner])

    return (
        <AnimatePresence>
            {shouldShowBanner && (
                <DonationBannerStyled
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{
                        duration: 0.5,
                        initial: {
                            delay: 1
                        }
                    }}>
                    <h3>Support RaidHub</h3>
                    <p>
                        RaidHub is committed to operating <u>ad-free</u> and remaining free to use.
                        If you enjoy using RaidHub and would like to see it continue to be
                        maintained, please consider supporting us by becoming a member or tipping us
                        on Ko-fi.
                    </p>
                    <Flex $gap={0.5} $crossAxis="stretch">
                        <Link href="https://ko-fi.com/raidhub" target="_blank" style={{ flex: 1 }}>
                            <SButton className="support">Support RaidHub</SButton>
                        </Link>
                        <SButton
                            className="dismiss"
                            onClick={() => {
                                setKofiBannerDismissDate(new Date().toISOString())
                                setKofiBannerNotShown(0)
                            }}>
                            Not Today
                        </SButton>
                    </Flex>
                </DonationBannerStyled>
            )}
        </AnimatePresence>
    )
}

const DonationBannerStyled = styled(m.div)`
    ${$media.min.tablet`
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 100;

        width: 320px;
        border-radius: 1rem;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        padding: 1rem;
    `}
    padding: 0.25rem;

    background-color: #e3e3e3;
    color: #050505;
    letter-spacing: 0.05rem;
    font-weight: 600;
    text-align: center;

    h3 {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
        font-weight: 700;
        color: #333;
    }

    p {
        text-align: left;
        font-size: 0.9rem;
        color: #444;
        margin-bottom: 1rem;
    }
`

const SButton = styled.button`
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    border: none;

    &.support {
        background-color: #ff3b72;
        color: white;

        &:hover {
            background-color: #e63363;
        }
    }

    &.dismiss {
        background-color: gray;
        color: white;

        &:hover {
            background-color: #5a5a5a;
        }
    }
`
