"use client"

import { Collection } from "@discordjs/collection"
import { type UserInfoCard } from "bungie-net-core/models"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { useDestinyPlayerByBungieName, useSearchByGlobalName } from "~/services/bungie/hooks"
import { useRaidHubPlayerSearch } from "~/services/raidhub/hooks"
import { type RaidHubDestinyMembershipType, type RaidHubPlayerInfo } from "~/services/raidhub/types"
import { isPrimaryCrossSave } from "~/util/destiny/crossSave"
import { getBungieDisplayName } from "~/util/destiny/getBungieDisplayName"
import { useDebounce } from "./util/useDebounce"

export function useSearch(props?: {
    onRedirect?: (result: RaidHubPlayerInfo) => void
    navigateOnEnter?: boolean
}) {
    const router = useRouter()

    const [enteredText, setEnteredText] = useState("")
    const [enterPressed, setEnterPressed] = useState(false)
    const [debouncedQuery, forceUpdateQuery] = useDebounce(
        enteredText,
        200,
        enteredText.length >= 3 || enteredText.includes("#")
    )

    const raidHubSearchQuery = useRaidHubPlayerSearch(debouncedQuery)
    /**
     * if the raidhub search is done and no results are found,
     * or the  raidhub search errored, we should use the bungie search
     * */
    const shouldUseBungieSearch =
        !raidHubSearchQuery.isFetching &&
        (raidHubSearchQuery.data?.length === 0 || raidHubSearchQuery.isError)
    const exactGlobalName = useMemo(() => debouncedQuery.split("#"), [debouncedQuery])
    const bungieExactGlobalNameQuery = useDestinyPlayerByBungieName(
        {
            displayName: exactGlobalName[0],
            displayNameCode: Number(exactGlobalName[1]?.substring(0, 4))
        },
        {
            enabled: shouldUseBungieSearch && exactGlobalName.length === 2,
            cacheTime: 60_000,
            select: users => users.filter(p => isPrimaryCrossSave(p))
        }
    )
    const bungieDisplayNamePrefixQuery = useSearchByGlobalName(
        { displayNamePrefix: exactGlobalName[0] },
        {
            enabled:
                shouldUseBungieSearch &&
                (exactGlobalName.length === 1 || bungieExactGlobalNameQuery.data?.length === 0),
            cacheTime: 60_000,
            select: ({ searchResults }) =>
                searchResults.flatMap(res =>
                    res.destinyMemberships.filter(m => isPrimaryCrossSave(m))
                )
        }
    )

    const aggregatedResults = useMemo(() => {
        const results = new Collection<string, RaidHubPlayerInfo>()
        if (raidHubSearchQuery.isSuccess) {
            raidHubSearchQuery.data.forEach(p => results.set(p.membershipId, p))
        } else {
            bungieExactGlobalNameQuery.data
                ?.map(mapUserInfoCardToSearchResult)
                .forEach(p => results.set(p.membershipId, p))
            bungieDisplayNamePrefixQuery.data
                ?.map(mapUserInfoCardToSearchResult)
                .forEach(p => results.set(p.membershipId, p))
        }

        return results
    }, [bungieExactGlobalNameQuery, bungieDisplayNamePrefixQuery, raidHubSearchQuery])

    const filteredResults = useMemo<typeof aggregatedResults>(
        () =>
            enteredText
                ? aggregatedResults.filter(p =>
                      getBungieDisplayName(p).toLowerCase().includes(enteredText.toLowerCase())
                  )
                : new Collection(),
        [aggregatedResults, enteredText]
    )

    const clearQuery = useCallback(() => {
        setEnteredText("")
        forceUpdateQuery("")
    }, [forceUpdateQuery])

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setEnteredText(event.target.value)
    }

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        forceUpdateQuery(enteredText)
        setEnterPressed(true)
    }

    /**
     * Redirect if only one result is found and the user has pressed enter
     */
    if (
        enterPressed &&
        props?.navigateOnEnter &&
        !raidHubSearchQuery.isStale &&
        raidHubSearchQuery.isSuccess &&
        raidHubSearchQuery.data.length === 1
    ) {
        const result = raidHubSearchQuery.data[0]
        setEnterPressed(false)
        props.onRedirect?.(result)
        router.push(`/profile/${result.membershipId}`)
    }

    return {
        enteredText,
        results: filteredResults,
        handleInputChange,
        handleFormSubmit,
        clearQuery,
        isLoading:
            raidHubSearchQuery.isFetching ||
            bungieExactGlobalNameQuery.isFetching ||
            bungieDisplayNamePrefixQuery.isFetching
    }
}

function mapUserInfoCardToSearchResult(res: UserInfoCard): RaidHubPlayerInfo {
    return {
        membershipId: res.membershipId,
        membershipType: res.membershipType as RaidHubDestinyMembershipType,
        iconPath: res.iconPath,
        displayName: res.displayName,
        lastSeen: "",
        ...(res.bungieGlobalDisplayNameCode
            ? {
                  bungieGlobalDisplayName: res.bungieGlobalDisplayName,
                  bungieGlobalDisplayNameCode: String(res.bungieGlobalDisplayNameCode).padStart(
                      4,
                      "0"
                  )
              }
            : {
                  bungieGlobalDisplayName: null,
                  bungieGlobalDisplayNameCode: null
              }),
        isPrivate: false,
        cheatLevel: 0
    }
}
