"use client"

import styled from "styled-components"
export const H4 = styled.h4<{
    $mBlock?: number
}>`
    color: ${({ theme }) => theme.colors.text.secondary};

    font-size: 1rem;
    font-weight: 300;
    text-transform: uppercase;
    letter-spacing: 0.25cap;

    ${({ $mBlock }) => typeof $mBlock !== "undefined" && `margin-block: ${$mBlock}em;`}
`
