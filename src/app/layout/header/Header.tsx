"use client"

import { type ReactNode } from "react"
import styled from "styled-components"
import { BackdropBlur } from "~/components/BackdropBlur"

export const Header = (props: { children: ReactNode }) => {
    return (
        <StyledHeader id="header">
            {props.children}
            <BackdropBlur $radius={8} />
        </StyledHeader>
    )
}

const StyledHeader = styled.header`
    position: sticky;
    top: 0;
    z-index: 50;

    min-width: 100%;
    padding: 0.2em;

    background-color: color-mix(in srgb, ${({ theme }) => theme.colors.background.dark}, #0000 85%);

    border-top: 1px solid ${({ theme }) => theme.colors.border.dark};

    border-bottom: 1px solid
        color-mix(in srgb, ${({ theme }) => theme.colors.border.dark}, #0000 60%);
`
