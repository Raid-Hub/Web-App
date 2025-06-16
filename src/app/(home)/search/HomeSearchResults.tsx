import type { ReadonlyCollection } from "@discordjs/collection"
import styled from "styled-components"
import { SinglePlayerSearchResult } from "~/components/SinglePlayerSearchResult"
import { Grid } from "~/components/__deprecated__/layout/Grid"
import type { RaidHubPlayerInfo } from "~/services/raidhub/types"

export const HomeSearchResults = (props: {
    results: ReadonlyCollection<string, RaidHubPlayerInfo>
}) => {
    return (
        <Container>
            <Grid $gap={0} $minCardWidth={240}>
                {props.results.map((result, idx) => (
                    <SinglePlayerSearchResult key={idx} player={result} size={1.25} />
                ))}
            </Grid>
        </Container>
    )
}

const Container = styled.div`
    position: absolute;
    top: 100%;

    min-height: 20em;
    min-width: calc(100% - 2em);
    max-height: calc(100vh - 2em);

    overflow-y: auto;
    overflow-x: hidden;

    margin: 1em;
    padding: 0em;

    background-color: color-mix(in srgb, ${props => props.theme.colors.background.dark}, #0000 5%);
    border-radius: 2px;
    border: 1px solid color-mix(in srgb, ${props => props.theme.colors.border.dark}, #0000 60%);

    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
`
