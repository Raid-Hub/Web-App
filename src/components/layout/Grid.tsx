"use client"

import styled, { css } from "styled-components"
import { $media } from "~/lib/media"

export const Grid = styled.div.attrs<{
    $minCardWidth?: number
    $minCardWidthMobile?: number
    $numCols?: number
    $gap?: number
    $fullWidth?: boolean
    $relative?: boolean
}>(attrs => ({
    ...attrs,
    $minCardWidth: attrs.$minCardWidth ?? 250,
    $minCardWidthMobile: attrs.$minCardWidthMobile ?? (attrs.$minCardWidth ?? 250) * 0.8
}))`
    position: ${props => (props.$relative ? "relative" : "static")};
    display: grid;
    ${props => css`
        grid-template-columns: repeat(
            ${props.$numCols ?? "auto-fill"},
            minmax(min(${props.$minCardWidth}px, 100%), 1fr)
        );

        ${$media.max.mobile`
            grid-template-columns: repeat(
                ${props.$numCols ?? "auto-fill"},
                minmax(min(${props.$minCardWidthMobile}px, 100%), 1fr)
            );
        `}
    `}

    gap: ${props => props.$gap}rem;
    width: ${props => (props.$fullWidth ? "100%" : "auto")};
`

Grid.defaultProps = {
    $gap: 1.5
}
