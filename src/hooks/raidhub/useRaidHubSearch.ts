import { useCallback, useEffect, useRef, useState } from "react"
import { useBungieClient } from "../../components/app/TokenManager"
import { wait } from "../../util/wait"
import { RaidHubSearchResult } from "~/types/raidhub-api"
import { useRouter } from "next/router"
import { searchRaidHubUser } from "~/services/raidhub/search"

const DEBOUNCE = 250

export function useRaidHubSearch(props?: { onRedirect?: (result: RaidHubSearchResult) => void }) {
    const [enteredText, setEnteredText] = useState("")
    const nextQuery = useRef("")
    const lastSearch = useRef<number>(Date.now())
    const [isLoading, setLoading] = useState<boolean>(false)
    const [results, setResults] = useState<RaidHubSearchResult[]>([])
    const [error, setError] = useState<Error | null>(null)

    const client = useBungieClient()
    const router = useRouter()

    const clearQuery = useCallback(() => {
        nextQuery.current = ""
        setTimeout(() => setEnteredText(""), 200)
    }, [])

    useEffect(() => {
        router.query
        clearQuery()
        setResults([])
    }, [router.query, clearQuery])

    const fetchUsers = useCallback(
        async (query: string) => {
            const currentSearch = Date.now()
            lastSearch.current = currentSearch

            try {
                if (!query) {
                    setResults([])
                    return
                }
                setLoading(true)
                const results = await searchRaidHubUser(query, client)
                if (lastSearch.current === currentSearch) {
                    setResults(results)
                    return results
                }
            } catch (e: any) {
                setError(e)
            } finally {
                setLoading(false)
            }
        },
        [client]
    )

    const debounceQuery = useCallback(
        async (potentialQuery: string) => {
            await wait(DEBOUNCE)
            if (potentialQuery === nextQuery.current) {
                fetchUsers(potentialQuery)
            }
        },
        [fetchUsers]
    )

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = event.target.value
        setEnteredText(newQuery)
        nextQuery.current = newQuery
        debounceQuery(newQuery)
    }

    const handleFormEnter = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const results = await fetchUsers(enteredText)

        if (props?.onRedirect && results?.length === 1) {
            const result = results[0]

            props.onRedirect(result)

            router.push(
                "/profile/[destinyMembershipType]/[destinyMembershipId]",
                `/profile/${result.membershipType}/${result.membershipId}`
            )
        }
    }

    const filteredResults = results.filter(
        r =>
            r.displayName.toLowerCase().includes(enteredText.toLowerCase()) ||
            `${r.bungieGlobalDisplayName ?? ""}#${r.bungieGlobalDisplayNameCode ?? ""}`
                .toLowerCase()
                .includes(enteredText.toLowerCase())
    )

    return {
        enteredText,
        results: filteredResults,
        isLoading,
        error,
        handleInputChange,
        handleFormEnter,
        clearQuery
    }
}
