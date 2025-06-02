"use client"

import {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    useState,
    type HTMLAttributes
} from "react"
import styled from "styled-components"
import { $media } from "~/lib/media"

export const TooltipContainer = forwardRef<
    HTMLDivElement,
    Omit<HTMLAttributes<HTMLDivElement>, "onMouseEnter" | "onMouseLeave" | "onFocus" | "onBlur"> & {
        children: JSX.Element
    } & {
        tooltipId: string
        tooltipBody: JSX.Element
        $aspectRatio?: {
            width: number
            height: number
        }
        $bottom?: boolean
        $fullWidth?: boolean
    }
>(({ children, tooltipId, tooltipBody, $bottom, ...props }, ref) => {
    const [$show, setShow] = useState(false)
    return (
        <StyledTooltipContainer
            ref={ref}
            {...props}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}>
            {Children.map(children, child => {
                try {
                    return isValidElement(child)
                        ? cloneElement(
                              child,
                              ($show ? { "aria-describedby": tooltipId } : {}) as object
                          )
                        : child
                } catch {
                    return child
                }
            })}
            {$show && (
                <StyledTooltip $bottom={$bottom} role="tooltip">
                    {tooltipBody}
                </StyledTooltip>
            )}
        </StyledTooltipContainer>
    )
})
TooltipContainer.displayName = "TooltipContainer"

const StyledTooltipContainer = styled.div<{
    $aspectRatio?: {
        width: number
        height: number
    }
    $fullWidth?: boolean
}>`
    display: flex;
    position: relative;
    z-index: 11;

    ${({ $aspectRatio }) =>
        $aspectRatio ? `aspect-ratio: ${$aspectRatio.width}/${$aspectRatio.height};` : ""}
    ${({ $fullWidth }) => $fullWidth && "width: 100%;"}
`

const StyledTooltip = styled.div<{
    $bottom?: boolean
}>`
    position: absolute;
    ${({ $bottom }) => ($bottom ? "top" : "bottom")}: 100%;
    left: 50%;
    transform: translateX(-50%);

    width: max-content;
    max-width: 20em;

    ${$media.max.mobile`
        max-width: 8em;
    `}
`
StyledTooltip.defaultProps = {
    $bottom: false
}

export const TooltipData = styled.div<{
    $mb?: number
    $mt?: number
}>`
    overflow: visible;
    padding: 0.3em 0.6em;
    font-size: 0.875rem;
    border-radius: 0.3em;

    background-color: color-mix(in srgb, ${({ theme }) => theme.colors.background.dark}, #0000 5%);
    text-align: center;

    border: 0.5px solid color-mix(in srgb, ${({ theme }) => theme.colors.border.light}, #0000 70%);

    ${({ $mb }) => ($mb ? `margin-bottom: ${$mb}em;` : "")}
    ${({ $mt }) => ($mt ? `margin-top: ${$mt}em;` : "")}
`
TooltipData.defaultProps = {
    $mb: 0
}
