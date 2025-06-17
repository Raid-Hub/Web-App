"use client"

import { useCallback, useRef, useState } from "react"
import styled from "styled-components"
import { Loader } from "~/components/Loader"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { SearchInput } from "~/components/form/SearchInput"
import Search from "~/components/icons/Search"
import { useLocale } from "~/components/providers/LocaleManager"
import { useSearch } from "~/hooks/useSearch"
import { useClickOutside } from "~/hooks/util/useClickOutside"
import { usePageChange } from "~/hooks/util/usePageChange"
import { $media } from "~/lib/media"
import { HeaderSearchResults } from "./HeaderSearchResults"

const HIDE_AFTER_CLICK = 100

export const SearchBar = () => {
    const { userAgent } = useLocale()
    const OSKey = userAgent.device.vendor?.toLowerCase().includes("Apple") ? "⌘" : "ctrl"

    const hideResults = useCallback(() => setIsShowingResults(false), [])

    const { enteredText, isLoading, results, handleInputChange, handleFormSubmit, clearQuery } =
        useSearch({
            onRedirect: hideResults
        })
    const [isShowingResults, setIsShowingResults] = useState(false)
    const searchContainerRef = useRef<HTMLFormElement>(null)

    const handleSelect = () => {
        clearQuery()
        setTimeout(hideResults, HIDE_AFTER_CLICK)
    }

    useClickOutside(searchContainerRef, hideResults, { enabled: isShowingResults, lockout: 150 })
    usePageChange(clearQuery)

    return (
        <Container onSubmit={handleFormSubmit} ref={searchContainerRef}>
            <Left>
                <IconContainer>
                    <Search color="white" />
                </IconContainer>
            </Left>
            <SearchInput
                $size={5}
                $pl={1.5}
                $insetRight={6}
                placeholder="Search for a Guardian..."
                value={enteredText}
                onClick={() => setIsShowingResults(true)}
                onChange={e => {
                    handleInputChange(e)
                    setIsShowingResults(true)
                }}
            />
            <Right>
                {isLoading && (
                    <IconContainer>
                        <Loader $stroke={2} />
                    </IconContainer>
                )}
                {userAgent && (
                    <Keys $padding={0} $gap={0.2}>
                        <kbd>{OSKey}</kbd>
                        <kbd>k</kbd>
                    </Keys>
                )}
            </Right>
            {isShowingResults && (
                <HeaderSearchResults
                    results={Array.from(results.values())}
                    handleSelect={handleSelect}
                />
            )}
        </Container>
    )
}

const Container = styled.form`
    position: relative;

    ${$media.max.tablet`
        min-width: 50vw;
    `}

    ${$media.max.mobile`
        min-width: 60vw;
    `}
`

const IconContainer = styled.div`
    position: relative;
    min-width: 1.25rem;
    aspect-ratio: 1/1;
`

const Left = styled.div`
    position: absolute;
    left: 0.5em;
    top: 50%;
    transform: translateY(-50%);
`

const Right = styled(Flex)`
    position: absolute;
    right: 0.3em;
    top: 50%;
    transform: translateY(-50%);
`
Right.defaultProps = {
    $gap: 0.5,
    $padding: 0
}

const Keys = styled(Flex)`
    font-size: 1rem;
    user-select: none;
    color: ${({ theme }) => theme.colors.text.secondary};

    & * {
        display: inline-block;
        font-weight: 500;
        line-height: 1;
    }

    & kbd {
        background-color: color-mix(
            in srgb,
            ${({ theme }) => theme.colors.background.medium},
            #0000 65%
        );
        padding: 0.12em 0.3em;
        border-radius: 0.2em;
    }

    ${$media.max.tablet`
    display: none;
`}
`
