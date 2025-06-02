"use client"

import styled from "styled-components"
import { $media } from "~/lib/media"

export type InputProps = {
    $size: number
    $pl?: number
    $insetRight?: number
}

export const Input = styled.input<InputProps>`
    height: ${({ $size }) => $size / 2}em;
    width: 100%;
    padding: ${({ $size }) => $size / 4}em;
    padding-left: ${({ $pl, $size }) => $size / 4 + ($pl ?? 0)}em;
    padding-right: ${({ $insetRight, $size }) => $size / 4 + ($insetRight ?? 0)}em;
    ${({ $size }) => $media.max.tablet`
        padding-right: ${$size / 4}em;
    `}

    font-size: ${({ $size }) => $size / 6}rem;

    border-radius: ${({ $size }) => $size * 1.5}px;
    border: 1px solid color-mix(in srgb, ${props => props.theme.colors.border.dark}, #0000 60%);

    background-color: color-mix(
        in srgb,
        ${({ theme }) => theme.colors.background.medium},
        #0000 80%
    );
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: color 0.2s;

    &::placeholder {
        color: color-mix(in srgb, ${({ theme }) => theme.colors.text.tertiary}, #0000 60%);
    }

    &:focus-visible {
        outline: none;
        ring: 1;
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`
