"use client"

import { useEffect, useState, type MouseEventHandler } from "react"
import { toast } from "sonner"
import { AdminPageHeader } from "~/components/admin/admin-page-header"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"
import { useRaidHubAdminQuery } from "~/services/raidhub/hooks"
import { Badge } from "~/shad/badge"
import { Button } from "~/shad/button"
import { Input } from "~/shad/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "~/shad/select"
import { DataView } from "./query-data-view"
import { SqlEditor } from "./sql-editor"

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

    // Add toast notifications for query results
    useEffect(() => {
        if (mutation.isSuccess && mutation.data.type === "SELECT") {
            const rowCount = mutation.data.data?.length ?? 0
            toast.success(`Query executed successfully`, {
                description: `${rowCount} row${rowCount !== 1 ? "s" : ""} returned`
            })
        } else if (mutation.isSuccess && mutation.data.type === "EXPLAIN") {
            toast.success("Explain plan generated successfully")
        }
    }, [mutation.isSuccess, mutation.data])

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
        <div className="flex h-full w-full flex-1 flex-col">
            <AdminPageHeader
                title="SQL Query Tool"
                description="Execute SQL queries and view results"
            />

            {/* Saved Query Management Toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-sm border border-white/10 bg-black/30 p-3 backdrop-blur-sm">
                {!!Object.keys(store).length && (
                    <Select
                        value={selectedQueryKey ?? undefined}
                        onValueChange={value => setSelectedQueryKey(value)}>
                        <SelectTrigger className="w-[200px] border-zinc-700/50 bg-zinc-900/90 text-zinc-200">
                            <SelectValue placeholder="Select a query" />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-700/50 bg-zinc-900 text-zinc-200">
                            {Object.entries(store).map(([key, { title }]) => (
                                <SelectItem
                                    key={key}
                                    value={key}
                                    className="focus:bg-zinc-800 focus:text-zinc-100">
                                    {title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                <Input
                    type="text"
                    value={queryTitle}
                    onChange={e => setQueryTitle(e.target.value)}
                    placeholder="Query title"
                    className="w-[200px] border-zinc-700/50 bg-zinc-900/90 text-zinc-200"
                />
                <Button
                    variant="outline"
                    onClick={handleSave(false)}
                    disabled={!selectedQueryKey || !queryText}
                    className="border-zinc-700/50 bg-zinc-900/90 text-zinc-200 hover:bg-zinc-800">
                    Save
                </Button>
                <Button
                    variant="outline"
                    onClick={handleSave(true)}
                    disabled={!queryText || Object.values(store).some(v => v.title === queryTitle)}
                    className="border-zinc-700/50 bg-zinc-900/90 text-zinc-200 hover:bg-zinc-800">
                    Save New
                </Button>
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={!selectedQueryKey || Object.values(store).length === 1}>
                    Delete
                </Button>
                {unsavedChanges && (
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                        Unsaved Changes
                    </Badge>
                )}
            </div>

            {/* SQL Editor */}
            <form onSubmit={e => e.preventDefault()} className="mb-6 w-full space-y-4">
                <SqlEditor value={queryText} onChange={setQueryText} />
                <div className="flex flex-wrap items-center gap-2">
                    <Button onClick={handleSubmit} type="submit" disabled={submitBtnsDisabled}>
                        Submit
                    </Button>
                    <Button
                        onClick={handleExplainSubmit}
                        type="submit"
                        disabled={submitBtnsDisabled}
                        variant="outline">
                        Explain
                    </Button>
                    <Button
                        onClick={mutation.reset}
                        type="reset"
                        disabled={
                            mutation.isIdle ||
                            mutation.isLoading ||
                            mutation.data?.type === "HIGH COST"
                        }
                        variant="outline">
                        Clear Results
                    </Button>

                    {mutation.isLoading && (
                        <Button onClick={cancel} variant="destructive">
                            Cancel
                        </Button>
                    )}
                </div>
            </form>

            {/* Results/Errors */}
            <DataView title={queryTitle} mutation={mutation} />

            {/* High Cost Warning */}
            {mutation.data?.type === "HIGH COST" && (
                <div className="flex flex-wrap items-center gap-2 rounded-sm border border-yellow-500/50 bg-yellow-500/10 p-4">
                    <Button
                        onClick={() =>
                            mutation.mutate({
                                query: queryText,
                                type: "SELECT",
                                ignoreCost: true
                            })
                        }>
                        Continue anyways
                    </Button>
                    <Button onClick={() => mutation.reset()} variant="destructive">
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    )
}

