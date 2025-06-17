"use client"

import { useCallback, useRef, useState } from "react"
import { useTypewriter } from "react-simple-typewriter"
import styled from "styled-components"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { SearchInput, type SearchInputProps } from "~/components/form/SearchInput"
import Search from "~/components/icons/Search"
import { useSearch } from "~/hooks/useSearch"
import { useClickOutside } from "~/hooks/util/useClickOutside"
import { $media } from "~/lib/media"
import { HomeSearchResults } from "./HomeSearchResults"

export const HomeSearchBar = () => {
    const ref = useRef<HTMLFormElement>(null)
    const [showingResults, setShowingResults] = useState(false)
    const [isSearchFocused, setIsSearchFocused] = useState(false)

    const { enteredText, handleInputChange, results, handleFormSubmit } = useSearch({
        navigateOnEnter: true,
        onRedirect: () => {
            setShowingResults(false)
        }
    })

    const handleFocus = () => {
        setIsSearchFocused(true)
        setShowingResults(true)
    }

    const handleClickOutside = useCallback(() => setShowingResults(false), [])

    useClickOutside(ref, handleClickOutside, { lockout: 100, enabled: true })

    return (
        <FormContainer onSubmit={handleFormSubmit} ref={ref} $isFocused={isSearchFocused}>
            <Flex $padding={0}>
                <SearchIcon color="white" absolute sx={24} />
                <TypeWriterSearchInput
                    $size={6}
                    $pl={1.5}
                    value={enteredText}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={() => setIsSearchFocused(false)}
                    onClick={() => setShowingResults(true)}
                />
            </Flex>
            {showingResults && <HomeSearchResults results={results} />}
        </FormContainer>
    )
}

const TypeWriterSearchInput = (props: Omit<SearchInputProps, "placeholder">) => {
    /* we isolate the hook here to avoid re-rendering the entire component when the typewriter updates */
    const [typeWriterText] = useTypewriter({
        words: ["Search for a Guardian..."],
        typeSpeed: 80,
        deleteSpeed: 60,
        loop: true,
        delaySpeed: 2000
    })

    return <SearchInput placeholder={typeWriterText} {...props} />
}

const SearchIcon = styled(Search)`
    left: 15px;
`

const FormContainer = styled.form<{ $isFocused: boolean }>`
    position: relative;
    z-index: 1;

    margin: 0 auto;
    width: 60%;

    & input {
        transition: border-color 0.2s ease;
    }
    ${({ $isFocused, theme }) =>
        $isFocused &&
        `
            & input {
                border-color: color-mix(in srgb, ${theme.colors.border.medium}, #0000 40%);
            }
        `}

    ${$media.max.tablet`
        width: 80%;
    `}

    ${$media.max.mobile`
        width: 90%;
    `}
`
