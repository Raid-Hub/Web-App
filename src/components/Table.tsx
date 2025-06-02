import styled from "styled-components"
import { $media } from "~/lib/media"

export const Table = styled.table<{
    $padding?: number
    $align?: true
}>`
    border-collapse: collapse;
    background-color: color-mix(in srgb, ${({ theme }) => theme.colors.background.dark}, #0000 60%);

    & tr:nth-child(even) {
        background-color: color-mix(
            in srgb,
            ${({ theme }) => theme.colors.background.medium},
            #0000 80%
        );
    }

    & th,
    td {
        border-top: 1px solid
            color-mix(in srgb, ${({ theme }) => theme.colors.border.dark}, #0000 40%);
        border-bottom: 1px solid
            color-mix(in srgb, ${({ theme }) => theme.colors.border.dark}, #0000 40%);

        ${({ $padding }) => `padding: ${$padding ?? 1}rem ${($padding ?? 1) * 1.5}rem;`}
        ${({ $align }) => $align && `text-align: center;`}
        letter-spacing: 0.04em;

        font-weight: 500;
        font-size: 0.875rem;
        ${$media.max.mobile`
            font-size: 0.75rem;
        `}
    }

    & th {
        text-align: left;
    }

    & td:first-child,
    th:first-child {
        border-left: 1px solid
            color-mix(in srgb, ${({ theme }) => theme.colors.border.dark}, #0000 40%);
    }

    & td:last-child,
    th:last-child {
        border-right: 1px solid
            color-mix(in srgb, ${({ theme }) => theme.colors.border.dark}, #0000 40%);
    }
`
