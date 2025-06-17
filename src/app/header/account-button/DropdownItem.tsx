"use client"

import Link from "next/link"
import styled from "styled-components"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import RightChevron from "~/components/icons/RightChevron"

export const DropdownLink = (props: { href: string; title: string }) => (
    <Link href={props.href} style={{ width: "100%" }}>
        <DropdownItemContainer>
            <DropDownTitle>{props.title}</DropDownTitle>
            <RightChevron color="orange" sx={24} />
        </DropdownItemContainer>
    </Link>
)

export const DropdownButton = (props: { onClick: () => void; title: string }) => (
    <DropdownItemContainer onClick={props.onClick}>
        <DropDownTitle>{props.title}</DropDownTitle>
        <RightChevron color="orange" sx={24} />
    </DropdownItemContainer>
)

const DropDownTitle = styled.div`
    margin: 0.3em 0;
`

const DropdownItemContainer = styled(Flex)`
    cursor: pointer;
    &:hover {
        background-color: color-mix(
            in srgb,
            ${({ theme }) => theme.colors.highlight.orange},
            #0000 60%
        );
    }
`
DropdownItemContainer.defaultProps = {
    $padding: 0.2,
    $align: "space-between",
    $fullWidth: true
}
