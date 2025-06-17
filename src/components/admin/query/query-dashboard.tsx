"use client"

import { useEffect, useState, type MouseEventHandler } from "react"
import styled from "styled-components"
import { PageWrapper } from "~/components/PageWrapper"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"
import { useRaidHubAdminQuery } from "~/services/raidhub/hooks"
import { DataView } from "./query-data-view"

const defaultValue = {}

export function QueryDashboard() {
    const [queryText, setQueryText] = useState("SELECT 1")
    const [queryTitle, setQueryTitle] = useState("My Table")
    const [selectedQueryKey, setSelectedQueryKey] = useState<string | null>(null)
    const [store, setStore] = useLocalStorage<
        Record<
            string,
            {
                title: string
                query: string
            }
        >
    >("admin-queries", defaultValue)

    const { cancel, mutation } = useRaidHubAdminQuery()

    const handleSubmit: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault()
        mutation.mutate({ query: queryText, type: "SELECT" })
    }

    const handleExplainSubmit: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault()
        mutation.mutate({ query: queryText, type: "EXPLAIN" })
    }

    const handleSave =
        (saveNew: boolean): MouseEventHandler<HTMLButtonElement> =>
        () => {
            if (saveNew) {
                const newKey = crypto.getRandomValues(new Uint32Array(1))[0].toString(16)
                setSelectedQueryKey(newKey)
                setStore({
                    ...store,
                    [newKey]: {
                        title: queryTitle,
                        query: queryText
                    }
                })
            } else {
                if (!selectedQueryKey) return
                setStore({
                    ...store,
                    [selectedQueryKey]: {
                        title: queryTitle,
                        query: queryText
                    }
                })
            }
        }

    const handleDelete: MouseEventHandler<HTMLButtonElement> = () => {
        if (!selectedQueryKey) return
        delete store[selectedQueryKey]
        setStore(store)
        setSelectedQueryKey(Object.keys(store)[0] ?? null)
    }

    useEffect(() => {
        const key = selectedQueryKey ?? Object.keys(store)[0]
        if (!key) return

        const query = store[key]

        if (query) {
            setSelectedQueryKey(key)
            setQueryTitle(query.title)
            setQueryText(query.query)
        }
    }, [selectedQueryKey, setQueryText, store])

    const submitBtnsDisabled = mutation.data?.type === "HIGH COST" || mutation.isLoading

    const unsavedChanges = !selectedQueryKey || store[selectedQueryKey].query !== queryText

    return (
        <PageWrapper>
            <Flex $align="flex-start" $padding={0.25}>
                {!!Object.keys(store).length && (
                    <select
                        className="bg-black"
                        name="Load"
                        id="selector"
                        value={selectedQueryKey ?? "-"}
                        onChange={e => setSelectedQueryKey(e.target.value)}>
                        {Object.entries(store).map(([key, { title }]) => (
                            <option key={key} label={title} value={key}>
                                {key}
                            </option>
                        ))}
                    </select>
                )}
                <input
                    type="text"
                    value={queryTitle}
                    onChange={e => setQueryTitle(e.target.value)}
                />
                <button
                    type="button"
                    onClick={handleSave(false)}
                    disabled={!selectedQueryKey || !queryText}>
                    Save
                </button>
                <button
                    type="button"
                    onClick={handleSave(true)}
                    disabled={!queryText || Object.values(store).some(v => v.title === queryTitle)}>
                    Save New
                </button>
                <button
                    type="button"
                    disabled={!selectedQueryKey || Object.values(store).length === 1}
                    onClick={handleDelete}>
                    Delete
                </button>
                {unsavedChanges && <div>Unsaved Changes</div>}
            </Flex>
            <Container onSubmit={e => e.preventDefault()}>
                <CodeTextArea
                    placeholder="Enter SQL query here"
                    rows={10}
                    cols={50}
                    spellCheck={false}
                    value={queryText}
                    onChange={e => setQueryText(e.target.value)}
                />
                <Flex $align="flex-start" $padding={0.25}>
                    <button onClick={handleSubmit} type="submit" disabled={submitBtnsDisabled}>
                        Submit
                    </button>
                    <button
                        onClick={handleExplainSubmit}
                        type="submit"
                        disabled={submitBtnsDisabled}>
                        Explain
                    </button>
                    <button
                        onClick={mutation.reset}
                        type="reset"
                        disabled={
                            mutation.isIdle ||
                            mutation.isLoading ||
                            mutation.data?.type === "HIGH COST"
                        }>
                        Clear Results
                    </button>

                    {mutation.isLoading && <CancelButton onClick={cancel}>Cancel</CancelButton>}
                </Flex>
            </Container>
            <DataView title={queryTitle} mutation={mutation} />
            {mutation.data?.type === "HIGH COST" && (
                <Flex $align="flex-start">
                    <button
                        onClick={() =>
                            mutation.mutate({
                                query: queryText,
                                type: "SELECT",
                                ignoreCost: true
                            })
                        }>
                        Continue anyways
                    </button>
                    <CancelButton onClick={() => mutation.reset()}>Cancel</CancelButton>
                </Flex>
            )}
        </PageWrapper>
    )
}

const Container = styled.form`
    width: 100%;
    margin-bottom: 1.5em;
`

const CodeTextArea = styled.textarea`
    width: 100%;
    font-family: "Courier New", monospace;

    font-size: 18px;
    padding: 10px;

    border-radius: 5px;
    resize: vertical;

    background-color: rgb(26, 26, 26);
`

const CancelButton = styled.button.attrs({ type: "button" })`
    background-color: ${({ theme }) => theme.colors.button.destructive};
`
