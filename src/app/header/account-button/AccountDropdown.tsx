"use client"

import { m, type Variants } from "framer-motion"
import { signIn, signOut } from "next-auth/react"
import styled from "styled-components"
import { BackdropBlur } from "~/components/__deprecated__/BackdropBlur"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { useSession } from "~/hooks/app/useSession"
import { DropdownButton, DropdownLink } from "./DropdownItem"

const variants = {
    open: {
        scaleY: 1,
        opacity: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    },
    closed: {
        scaleY: 0,
        opacity: 0,
        transition: {
            when: "afterChildren"
        }
    }
} satisfies Variants

export const AccountDropdown = (props: { isDropdownOpen: boolean }) => {
    const { data: sessionData, status } = useSession()

    const animate: keyof typeof variants = props.isDropdownOpen ? "open" : "closed"

    const primaryProfile = sessionData?.user?.profiles?.find(
        p => p.destinyMembershipId === sessionData.primaryDestinyMembershipId
    )

    return (
        <Container initial={"closed"} animate={animate} variants={variants}>
            <Content $direction="column" $crossAxis="flex-start" $gap={0.25} $padding={0.85}>
                {status === "authenticated" ? (
                    <>
                        <div>
                            {sessionData?.user.name && <Username>{sessionData.user.name}</Username>}
                            <MembershipId>
                                {primaryProfile?.destinyMembershipId ??
                                    "No linked Destiny Accounts"}
                            </MembershipId>
                        </div>
                        <hr />
                        {primaryProfile && (
                            <DropdownLink
                                title="View Profile"
                                href={
                                    primaryProfile.vanity
                                        ? `/${primaryProfile.vanity}`
                                        : `/profile/${primaryProfile.destinyMembershipId}`
                                }
                            />
                        )}
                        <DropdownLink title="Manage Account" href="/account" />
                        {sessionData.user.role === "ADMIN" && (
                            <DropdownLink title="Admin Panel" href="/admin" />
                        )}
                        <DropdownButton
                            title="Log Out"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        />
                    </>
                ) : (
                    <DropdownButton title="Log In" onClick={() => signIn("bungie")} />
                )}
            </Content>
            <BackdropBlur $radius={4} />
        </Container>
    )
}

const Container = styled(m.div)`
    position: fixed;
    z-index: 101;

    top: 4em;

    right: 0.5em;
    width: 250px;

    border-radius: 6px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    background-color: color-mix(
        in srgb,
        ${({ theme }) => theme.colors.background.medium},
        #0000 55%
    );

    transform-origin: top;

    & a {
        color: ${({ theme }) => theme.colors.text.primary};
    }
`

const Content = styled(Flex)`
    overflow: hidden;
    border-radius: inherit;

    width: 100%;
    border: 1px solid color-mix(in srgb, ${({ theme }) => theme.colors.border.dark}, #0000 60%);

    & hr {
        border-width: 2px;
        width: 100%;
        border-color: color-mix(in srgb, ${({ theme }) => theme.colors.border.dark}, #0000 60%);
    }
`

const Username = styled.div`
    font-size: 1.2rem;
    font-weight: 600;
`

const MembershipId = styled.div`
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.secondary};
`
