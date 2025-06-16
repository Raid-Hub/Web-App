"use client"

import styled from "styled-components"

/**
 * @deprecated Use Tailwind's `flex` and `aspect-ratio` utilities instead.
 */
export const Flex = styled.div<{
    $relative?: boolean
    $padding?: number
    $paddingX?: number
    $paddingY?: number
    $direction?: "row" | "column"
    $gap?: number
    $align?: "center" | "flex-start" | "flex-end" | "stretch" | "space-between" | "space-around"
    $crossAxis?: "center" | "flex-start" | "flex-end" | "stretch"
    $fullWidth?: boolean
    $wrap?: boolean
}>`
    display: flex;
    position: ${({ $relative }) => ($relative ? "relative" : "static")};

    justify-content: ${({ $align }) => $align};
    align-items: ${({ $crossAxis }) => $crossAxis};
    flex-direction: ${({ $direction }) => $direction};
    gap: ${({ $gap }) => $gap}rem;
    flex-wrap: ${({ $wrap }) => ($wrap ? "wrap" : "nowrap")};

    padding: ${({ $padding }) => $padding}rem;
    ${({ $paddingX }) =>
        $paddingX && `padding-left: ${$paddingX}rem; padding-right: ${$paddingX}rem;`}
    ${({ $paddingY }) =>
        $paddingY && `padding-top: ${$paddingY}rem; padding-bottom: ${$paddingY}rem;`}
    ${({ $fullWidth }) => $fullWidth && "min-width: 100%; "}
`

Flex.defaultProps = {
    $relative: false,
    $padding: 1,
    $paddingX: undefined,
    $paddingY: undefined,
    $gap: 1,
    $direction: "row",
    $align: "center",
    $crossAxis: "center",
    $fullWidth: false,
    $wrap: false
}
