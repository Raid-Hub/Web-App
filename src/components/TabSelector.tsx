import styled from "styled-components"
import { $media } from "~/app/layout/media"
import { Flex } from "./layout/Flex"

export const TabSelector = styled(Flex)`
    & [aria-selected] {
        border-bottom: 1.5px solid ${props => props.theme.colors.border.dark};
        transition: border 150ms ease-in;
    }
    & [aria-selected="true"] {
        border-bottom: 1.5px solid ${props => props.theme.colors.brand.primary};
    }
    & > * {
        cursor: pointer;
    }

    ${$media.max.mobile`
        & h4 {
            font-size: 0.75rem;
        }
    `}
`

TabSelector.defaultProps = {
    $padding: 0.5,
    $gap: 0,
    $direction: "row",
    $align: "flex-start",
    $crossAxis: "flex-end",
    $wrap: true
}
