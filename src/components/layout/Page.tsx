"use client"

import styled from "styled-components"
import { $media } from "~/app/theme"

export const PageWrapper = styled.main`
    margin: 0.5em auto;

    ${$media.max.desktop`
         min-width: ${dimensions => dimensions.min};
         max-width: 85%;
    `}

    ${$media.max.laptop`
         min-width: ${dimensions => dimensions.min};
         max-width: 90%;
    `}

    ${$media.max.tablet`
         min-width: ${dimensions => dimensions.min};
         max-width: 95%;
    `}

    ${$media.max.mobile`
         min-width: ${dimensions => dimensions.min};
         max-width: 98%;
    `}

    ${$media.max.tiny`
         min-width: ${dimensions => dimensions.min};
            max-width: 100%;
    `}
`
