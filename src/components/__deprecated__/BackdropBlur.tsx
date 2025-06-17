"use client"

import styled from "styled-components"

/**
 * @deprecated Use Tailwind's `backdrop-blur` utility instead.
 */
export const BackdropBlur = styled.div<{
    $radius: number
}>`
    top: 0;
    left: 0;
    z-index: -1;
    position: absolute;
    width: 100%;
    height: 100%;

    backdrop-filter: blur(${({ $radius }) => $radius}px);
    -webkit-backdrop-filter: blur(${({ $radius }) => $radius}px);
`
