"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { SinglePlayerSearchResult } from "~/components/SinglePlayerSearchResult"
import { SearchInput } from "~/components/form/SearchInput"
import { Grid } from "~/components/layout/Grid"
import { useSearch } from "~/hooks/useSearch"
import { useClickOutside } from "~/hooks/util/useClickOutside"
import { useKeyPress } from "~/hooks/util/useKeyPress"
import { usePageChange } from "~/hooks/util/usePageChange"
import { $media } from "~/lib/media"

// TODO: animate the modal
export const SearchModal = () => {
    const [isDisplayed, setIsDisplayed] = useState(false)
    const modalElement = useRef<HTMLDivElement>(null)
    const inputElement = useRef<HTMLInputElement>(null)

    const handleK = useCallback(async () => {
        setIsDisplayed(!isDisplayed)
    }, [isDisplayed])

    const hideModal = useCallback(() => {
        setIsDisplayed(false)
    }, [])

    usePageChange(hideModal)

    useKeyPress({
        pressedKey: "k",
        ctrlOrMeta: true,
        preventDefault: true,
        handleEvent: handleK
    })

    useKeyPress({
        pressedKey: "Escape",
        disabled: !isDisplayed,
        handleEvent: hideModal
    })

    useClickOutside(modalElement, hideModal, { enabled: isDisplayed, lockout: 100 })

    useEffect(() => {
        if (isDisplayed) {
            inputElement.current?.focus()
        }
    }, [isDisplayed])

    const { enteredText, results, handleFormSubmit, handleInputChange } = useSearch({
        onRedirect: () => {
            void hideModal()
        }
    })

    return (
        <Container $iShowing={isDisplayed}>
            <Modal ref={modalElement}>
                <Form onSubmit={handleFormSubmit}>
                    <SearchInput
                        value={enteredText}
                        onChange={handleInputChange}
                        $size={6}
                        ref={inputElement}
                    />
                </Form>
                <Grid $gap={0} $minCardWidth={270}>
                    {results.map((player, idx) => (
                        <SinglePlayerSearchResult key={idx} player={player} size={1.5} />
                    ))}
                </Grid>
            </Modal>
        </Container>
    )
}

const Container = styled.div<{ $iShowing: boolean }>`
    z-index: 200;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;

    position: fixed;

    display: ${({ $iShowing }) => ($iShowing ? "block" : "none")};
    ${$media.max.tablet`
        display: none;
    `}
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
`

const Modal = styled.div`
    position: absolute;

    width: 70%;
    height: 70%;
    top: 15%;
    left: 15%;

    overflow-y: auto;

    border-radius: 1em;

    background-color: color-mix(in srgb, ${({ theme }) => theme.colors.background.dark}, #0000 5%);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
`

const Form = styled.form`
    position: sticky;
    top: 0;

    backdrop-filter: blur(10px);
`
