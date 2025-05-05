"use client"

import { forwardRef, type ComponentPropsWithoutRef } from "react"
import styled, { css, type DefaultTheme } from "styled-components"
import { $media } from "~/app/layout/media"
import { type deviceSizes } from "~/app/layout/theme"
import type { AtLeast } from "~/types/generic"
import { o } from "~/util/o"

export type SVGWrapperProps = Omit<
    {
        sx?: number | Partial<Record<keyof typeof deviceSizes, number>>
        color?: "none" | keyof DefaultTheme["colors"]["icon"]
        hoverColor?: keyof DefaultTheme["colors"]["icon"]
        absolute?: boolean
        pointer?: boolean
    } & React.SVGProps<SVGSVGElement>,
    "ref"
>

export type SVGComponent = (props: SVGWrapperProps) => JSX.Element

interface StyledSvgProps {
    $sx?: number | Partial<Record<keyof typeof deviceSizes, number>>
    $color?: "none" | keyof DefaultTheme["colors"]["icon"]
    $hoverColor?: keyof DefaultTheme["colors"]["icon"]
    $absolute?: boolean
    $pointer?: boolean
}
const StyledSvg = styled.svg<StyledSvgProps>`
    aspect-ratio: 1/1;
    ${({ $pointer }) => $pointer && "cursor: pointer"};
    ${({ $absolute }) => $absolute && "position: absolute;"}
    ${({ $sx }) =>
        typeof $sx === "number"
            ? `width: ${$sx}px;`
            : typeof $sx === "object"
              ? o.map(
                    $sx,
                    (device, value) => css`
                        ${$media.max[device]`
                             width: ${value}px;
                        `}
                    `
                )
              : ""}

    ${({ theme, $color }) => $color !== "none" && `fill: ${theme.colors.icon[$color ?? "white"]}`};

    ${({ theme, $hoverColor }) =>
        $hoverColor && theme.colors.icon[$hoverColor]
            ? `&:hover:not([aria-disabled="true"]) {fill: ${theme.colors.icon[$hoverColor]};}`
            : ""}
`
StyledSvg.defaultProps = {
    $color: "white"
}

export const SVG = forwardRef<SVGSVGElement, AtLeast<SVGWrapperProps, "viewBox">>(
    ({ sx, color, hoverColor, children, absolute, pointer, ...restOfProps }, ref) => (
        <StyledSvg
            ref={ref}
            $sx={sx}
            $color={color}
            $hoverColor={hoverColor}
            $absolute={absolute}
            $pointer={pointer}
            width={typeof sx === "number" ? sx : undefined}
            xmlns="http://www.w3.org/2000/svg"
            {...restOfProps}>
            {children}
        </StyledSvg>
    )
)

SVG.displayName = "SVG"

export const DeepFilledSvg = styled(SVG)<{
    $fill?: string
    $hoverFill?: string
}>`
    ${({ $fill, $hoverFill }) => css`
        & *:not([data-deep-filled="false"]) {
            fill: ${$fill};
        }

        &:hover {
            & *:not([data-deep-filled="false"]) {
                fill: ${$hoverFill};
            }
        }
    `}
`

export type SVGProps = Omit<ComponentPropsWithoutRef<"svg">, "viewBox">
