"use client"

import { type QueryKey } from "@tanstack/react-query"
import { useRef, useState } from "react"
import styled from "styled-components"
import { SinglePlayerSearchResult } from "~/components/SinglePlayerSearchResult"
import { Panel } from "~/components/__deprecated__/Panel"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { Grid } from "~/components/__deprecated__/layout/Grid"
import { SearchInput } from "~/components/form/SearchInput"
import { usePlayerSearch } from "~/hooks/usePlayerSearch"
import { useClickOutside } from "~/hooks/util/useClickOutside"
import { type RaidHubLeaderboardData } from "~/services/raidhub/types"
import { useLeaderboardPlayerSearch } from "./useLeaderboardPlayerSearch"

export const LeaderboardSearch = (args: {
    queryKeyWithoutPage: QueryKey
    mutationFn: (membershipId: string) => Promise<RaidHubLeaderboardData>
}) => {
    const [isShowingResults, setIsShowingResults] = useState(false)
    const ref = useRef<HTMLFormElement>(null)
    const { value: enteredText, results, setValue, clearQuery } = usePlayerSearch()

    const { mutate: search, reset } = useLeaderboardPlayerSearch(args)

    useClickOutside(ref, () => setIsShowingResults(false), {
        lockout: 100,
        enabled: isShowingResults
    })

    return (
        <Flex
            as="form"
            ref={ref}
            $padding={0}
            onSubmit={e => e.preventDefault()}
            onClick={() => setIsShowingResults(true)}
            style={{ flex: 1 }}>
            <SearchInput
                value={enteredText}
                onChange={e => setValue(e.target.value)}
                placeholder="Search the Leaderboard"
                $size={5}
            />
            {isShowingResults && !!results.size && (
                <Results>
                    <Panel $fullWidth>
                        <Grid $gap={0} $minCardWidth={180}>
                            {results.map((result, idx) => (
                                <SinglePlayerSearchResult
                                    key={idx}
                                    noLink
                                    handleSelect={() => {
                                        reset()
                                        search(result.membershipId)
                                        clearQuery()
                                    }}
                                    player={result}
                                    size={1.5}
                                />
                            ))}
                        </Grid>
                    </Panel>
                </Results>
            )}
        </Flex>
    )
}

const Results = styled.div`
    position: absolute;
    top: 115%;
    left: 0;
    right: 0;
    z-index: 1;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5x);
`
