"use client"

import styled, { css } from "styled-components"

/**
 * @deprecated Use Tailwind instead.
 */
export const Container = styled.div<{
    $minHeight?: number
    $aspectRatio?: {
        width: number
        height: number
    }
    $fullWidth?: boolean
    $fullHeight?: boolean
    $flex?: boolean
}>`
    position: relative;
    ${({ $aspectRatio, $minHeight, $fullWidth, $flex, $fullHeight }) => css`
        ${$aspectRatio ? `aspect-ratio: ${$aspectRatio.width}/${$aspectRatio.height};` : ""}
        ${$minHeight ? `min-height: ${$minHeight}px;` : ""}
        ${$fullWidth ? `width: 100%;` : ""}
        ${$fullHeight ? `height: 100%;` : ""}
        ${$flex ? `display: flex; justify-content: center; align-items: center` : ""}
    `}
`
