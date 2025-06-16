"use client"

import { useQueryClient, type QueryKey } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"
import { usePageProps } from "~/components/PageWrapper"
import { Panel } from "~/components/__deprecated__/Panel"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import NextArrow from "~/components/icons/NextArrow"
import PreviousArrow from "~/components/icons/PreviousArrow"
import PreviousArrowSkip from "~/components/icons/PreviousArrowSkip"
import ReloadArrow from "~/components/icons/ReloadArrow"
import { usePage } from "~/hooks/util/usePage"
import { useQueryParams } from "~/hooks/util/useQueryParams"
import { getRaidHubApi } from "~/services/raidhub/common"
import { type RaidHubLeaderboardURL } from "~/services/raidhub/types"
import { type PageProps } from "./Leaderboard"
import { LeaderboardSearch } from "./LeaderboardSearch"

export const LeaderboardControls = (props: { hasPages: boolean; hasSearch: boolean }) => {
    const { set, tx } = useQueryParams<{
        page: string
        position: string
    }>()
    const currentPage = usePage()
    const { entriesPerPage, apiUrl, params, queryKey } =
        usePageProps<PageProps<RaidHubLeaderboardURL>>()

    const queryClient = useQueryClient()
    const canGoBack = currentPage > 1
    const isFirstPage = currentPage === 1
    const [canGoForward] = useState(props.hasPages)

    const pagedQueryKey = useMemo<QueryKey>(
        () => [...queryKey, currentPage],
        [currentPage, queryKey]
    )

    const mutationFn = useCallback(
        async (membershipId: string) => {
            if (!props.hasSearch) {
                throw new Error("This function should not be called when search is enabled")
            }

            return await getRaidHubApi(apiUrl, params, {
                search: membershipId,
                count: entriesPerPage
            }).then(res => res.response)
        },
        [props.hasSearch, apiUrl, params, entriesPerPage]
    )

    const handleGoToFirstPage = () => {
        set("page", "1", false)
    }

    const handleForwards = () => {
        tx(
            ({ set, remove }) => {
                remove("position")
                set("page", String(currentPage + 1))
            },
            {
                history: true
            }
        )
    }

    const handleBackwards = () => {
        tx(
            ({ set, remove }) => {
                remove("position")
                set("page", String(currentPage - 1))
            },
            {
                history: true
            }
        )
    }

    return (
        <>
            {props.hasSearch && (
                <LeaderboardSearch queryKeyWithoutPage={queryKey} mutationFn={mutationFn} />
            )}
            <Panel>
                <Flex $padding={0}>
                    <ReloadArrow
                        sx={25}
                        color="white"
                        hoverColor="orange"
                        pointer
                        onClick={() => queryClient.refetchQueries(pagedQueryKey)}
                    />
                    {props.hasPages && (
                        <>
                            <PreviousArrowSkip
                                sx={20}
                                color={!isFirstPage ? "white" : "gray"}
                                hoverColor="orange"
                                pointer
                                aria-disabled={isFirstPage}
                                onClick={!isFirstPage ? handleGoToFirstPage : undefined}
                            />
                            <PreviousArrow
                                sx={20}
                                color={canGoBack ? "white" : "gray"}
                                hoverColor="orange"
                                pointer
                                aria-disabled={!canGoBack}
                                onClick={canGoBack ? handleBackwards : undefined}
                            />
                            <NextArrow
                                sx={20}
                                color={canGoForward ? "white" : "gray"}
                                hoverColor="orange"
                                pointer
                                aria-disabled={!canGoForward}
                                onClick={canGoForward ? handleForwards : undefined}
                            />
                        </>
                    )}
                </Flex>
            </Panel>
        </>
    )
}
