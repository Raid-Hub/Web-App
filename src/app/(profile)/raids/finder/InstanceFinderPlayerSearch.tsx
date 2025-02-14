import { memo, useCallback, useRef, useState } from "react"
import styled from "styled-components"
import { SinglePlayerSearchResult } from "~/components/SinglePlayerSearchResult"
import { SearchInput } from "~/components/form/SearchInput"
import { Container } from "~/components/layout/Container"
import { Grid } from "~/components/layout/Grid"
import { useSearch } from "~/hooks/useSearch"
import { useClickOutside } from "~/hooks/util/useClickOutside"
import { type RaidHubPlayerInfo } from "~/services/raidhub/types"

export const FinderPlayerSearch = memo(
    ({ onSelect }: { onSelect: (player: RaidHubPlayerInfo) => void }) => {
        const hideResults = useCallback(() => setIsShowingResults(false), [])

        const { enteredText, results, handleInputChange, clearQuery } = useSearch({
            onRedirect: hideResults
        })
        const [isShowingResults, setIsShowingResults] = useState(false)
        const searchContainerRef = useRef<HTMLDivElement>(null)

        useClickOutside(searchContainerRef, hideResults, {
            enabled: isShowingResults,
            lockout: 150
        })

        return (
            <Container ref={searchContainerRef} $fullWidth>
                <SearchInput
                    $size={5}
                    $pl={1.5}
                    $insetRight={6}
                    placeholder="Search for a Friend..."
                    value={enteredText}
                    onClick={() => setIsShowingResults(true)}
                    onChange={e => {
                        handleInputChange(e)
                        setIsShowingResults(true)
                    }}
                />
                {isShowingResults && (
                    <SearchResultsContainer>
                        <Grid $gap={0} $minCardWidth={250} $minCardWidthMobile={200}>
                            {results.map((player, idx) => (
                                <SinglePlayerSearchResult
                                    key={idx}
                                    player={player}
                                    size={1.2}
                                    noLink
                                    handleSelect={() => {
                                        clearQuery()
                                        onSelect(player)
                                        hideResults()
                                    }}
                                />
                            ))}
                        </Grid>
                    </SearchResultsContainer>
                )}
            </Container>
        )
    }
)

const SearchResultsContainer = styled.div`
    margin-top: 1rem;
    border-radius: 0.5rem;
    background-color: color-mix(in srgb, ${({ theme }) => theme.colors.background.dark}, #0000 20%);

    position: absolute;
    z-index: 1;
    top: 100%;
    width: 100%;
    backdrop-filter: blur(10px);
`

FinderPlayerSearch.displayName = "FinderPlayerSearch"
