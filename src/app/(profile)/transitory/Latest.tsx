import styled from "styled-components"
import { Container } from "~/components/layout/Container"
import { $media } from "~/lib/media"

export const Latest = styled(Container)<{
    $playerCount: number
}>`
    --w: calc(
        min(100%, ${({ $playerCount }) => Math.min(Math.max(0, $playerCount - 3), 6) * 100 + 400}px)
    );
    min-width: var(--w);
    flex-basis: var(--w);
    ${$media.max.tablet`
        flex: 1
    `};
`
