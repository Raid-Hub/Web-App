"use client"

import { useCallback, useRef, useState, type ReactNode } from "react"
import styled from "styled-components"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { useClickOutside } from "~/hooks/util/useClickOutside"
import { usePageChange } from "~/hooks/util/usePageChange"
import { AccountDropdown } from "./AccountDropdown"

export const AccountIcon = (props: { children: ReactNode }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const closeDropdown = useCallback(() => {
        setIsDropdownOpen(false)
    }, [])

    useClickOutside(ref, closeDropdown, { enabled: isDropdownOpen, lockout: 50 })
    usePageChange(closeDropdown)

    return (
        <Container ref={ref}>
            <IconContainer $padding={0} onClick={() => setIsDropdownOpen(v => !v)}>
                {props.children}
            </IconContainer>
            <AccountDropdown isDropdownOpen={isDropdownOpen} />
        </Container>
    )
}

const Container = styled.div`
    position: relative;
`

const IconContainer = styled(Flex)`
    position: relative;
    aspect-ratio: 1/1;
    cursor: pointer;
    overflow: hidden;
`
