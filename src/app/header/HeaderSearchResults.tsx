"use client"

import styled from "styled-components"
import { SinglePlayerSearchResult } from "~/components/SinglePlayerSearchResult"
import { Grid } from "~/components/layout/Grid"
import { $media } from "~/lib/media"
import { type RaidHubPlayerInfo } from "~/services/raidhub/types"

export const HeaderSearchResults = (props: {
    results: RaidHubPlayerInfo[]
    handleSelect?: () => void
}) => (
    <Container>
        <Grid $gap={0} $minCardWidth={200}>
            {props.results.map((player, idx) => (
                <SinglePlayerSearchResult
                    key={idx}
                    player={player}
                    size={1.2}
                    handleSelect={props.handleSelect}
                />
            ))}
        </Grid>
    </Container>
)

const Container = styled.div`
    z-index: 101;
    position: absolute;
    top: 110%;
    min-width: 100%;

    background-color: color-mix(in srgb, ${props => props.theme.colors.background.dark}, #0000 5%);
    border-radius: 2px;
    border: 1px solid color-mix(in srgb, ${props => props.theme.colors.border.dark}, #0000 60%);

    overflow-y: auto;
    max-height: 70vh;

    ${$media.max.tablet`
        max-height: 80vh;
    `}

    ${$media.max.mobile`
        max-height: 90vh;
    `}

    backdrop-filter: blur(10px);
`
