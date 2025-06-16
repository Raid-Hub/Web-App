import styled, { css } from "styled-components"

/**
 * @deprecated
 */
export const Panel = styled.div<{
    $maxWidth?: number
    $minWidth?: number
    $fullWidth?: boolean
    $growOnHover?: boolean
    $static?: boolean
    $padding?: number
    $backropBlur?: boolean
}>`
    ${({
        theme,
        $maxWidth,
        $fullWidth,
        $growOnHover,
        $static,
        $minWidth,
        $padding,
        $backropBlur
    }) => css`
        ${$backropBlur && "backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);"}
        position: ${$static ? "static" : "relative"};
        overflow: ${$static ? "visible" : "auto"};
        width: ${$fullWidth ? "100%" : "max-content"};
        min-width: ${$minWidth ? `${$minWidth}px` : "auto"};
        max-width: ${$maxWidth ? `${$maxWidth}px` : "100%"};
        padding: ${$padding}rem;
        background-color: color-mix(in srgb, ${theme.colors.background.dark}, #0000 40%);
        border: 1px solid color-mix(in srgb, ${theme.colors.border.dark}, #0000 40%);
        transition: transform 0.1s ease-in-out;
        ${$growOnHover &&
        css`
            &:hover {
                transform: scale(1.04);
            }
        `}
    `}
`

Panel.defaultProps = {
    $padding: 0.5
}
