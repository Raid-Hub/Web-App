import { Collection } from "@discordjs/collection"
import {
    useQueries,
    useQuery,
    useQueryClient,
    type Query,
    type UseQueryOptions
} from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession } from "~/hooks/app/useSession"
import { getRaidHubApi } from "./common"
import { type RaidHubInstanceForPlayer, type RaidHubPlayerHistoryResponse } from "./types"

async function getActivities({
    membershipId,
    cursor,
    bearerToken
}: {
    membershipId: string
    cursor?: string
    bearerToken?: string
}) {
    const authHeaders: HeadersInit = bearerToken
        ? {
              Authorization: `Bearer ${bearerToken}`
          }
        : {}

    const response = await getRaidHubApi(
        "/player/{membershipId}/history",
        { membershipId },
        { cursor, count: cursor ? 2000 : 250 },
        {
            headers: authHeaders
        }
    )
    return response.response
}

const useCreateQuery = <T = RaidHubPlayerHistoryResponse>(
    opts?: UseQueryOptions<RaidHubPlayerHistoryResponse, Error, T>
) => {
    const session = useSession()

    return useCallback(
        (
            membershipId: string,
            cursor?: string,
            overrides: UseQueryOptions<RaidHubPlayerHistoryResponse, Error, T> = {}
        ): UseQueryOptions<RaidHubPlayerHistoryResponse, Error, T> => ({
            queryKey: ["raidhub", "player", "activities", membershipId, cursor ?? ""] as const,
            queryFn: () =>
                getActivities({
                    membershipId,
                    cursor,
                    bearerToken: session.data?.raidHubAccessToken?.value
                }),
            refetchIntervalInBackground: false,
            retry: false,
            ...opts,
            ...overrides,
            ...(session.status === "loading" ? { enabled: false } : {})
        }),
        [opts, session.data?.raidHubAccessToken?.value, session.status]
    )
}

export const useRaidHubActivtiesFirstPage = <T = RaidHubPlayerHistoryResponse>(
    membershipId: string,
    opts?: UseQueryOptions<RaidHubPlayerHistoryResponse, Error, T>
) => {
    const createQuery = useCreateQuery(opts)

    return useQuery(createQuery(membershipId))
}
/**
 * @returns The activities of all memberships in reverse chronological order
 */
export const useRaidHubActivities = (
    membershipIds: string[],
    opts?: {
        enabled?: boolean
    }
): {
    refresh: () => void
    activities: Collection<string, RaidHubInstanceForPlayer>
    isLoading: boolean
} => {
    const queryClient = useQueryClient()
    // Collection of membership IDs and their cursors
    const [cursors, setCursors] = useState(() => new Collection<string, Set<string>>())

    const createQuery = useCreateQuery(opts)

    const handleSuccessfulFirstPage = useCallback((data: RaidHubPlayerHistoryResponse) => {
        setCursors(oldCursors => {
            // TODO: clear query cache for all cursors
            // Clear the old cursors
            oldCursors.get(data.membershipId)?.clear()
            return oldCursors
                .clone()
                .set(data.membershipId, new Set(data.nextCursor ? [data.nextCursor] : []))
        })
    }, [])

    const updateCursors = useCallback((data: RaidHubPlayerHistoryResponse) => {
        const { membershipId, nextCursor } = data
        if (!nextCursor) return

        setCursors(oldCursors => {
            const membershipCursors = oldCursors.get(membershipId)
            if (membershipCursors?.has(nextCursor)) return oldCursors

            const newCursors = oldCursors.clone()
            if (!membershipCursors) {
                newCursors.set(membershipId, new Set([nextCursor]))
            } else {
                newCursors.get(membershipId)!.add(nextCursor)
            }
            return newCursors
        })
    }, [])

    const allQueryOptions = useMemo(() => {
        const primaryQueries = membershipIds.map(membershipId =>
            createQuery(membershipId, undefined, {
                keepPreviousData: true,
                staleTime: 150_000,
                refetchInterval: 300_000,
                refetchIntervalInBackground: false,
                refetchOnWindowFocus: true,
                refetchOnReconnect: true,
                onSuccess: handleSuccessfulFirstPage
            })
        )
        const additionalQueries = cursors.map((cursors, membershipId) =>
            Array.from(cursors).map(c =>
                createQuery(membershipId, c, {
                    staleTime: Infinity,
                    refetchOnWindowFocus: false,
                    refetchOnReconnect: false,
                    onSuccess: updateCursors
                })
            )
        )
        return [...primaryQueries, ...additionalQueries.flat()]
    }, [membershipIds, cursors, createQuery, handleSuccessfulFirstPage, updateCursors])

    const queries = useQueries({
        queries: allQueryOptions
    })

    useEffect(() => {
        queries.forEach(query => {
            if (query.data) {
                updateCursors(query.data)
            }
        })
    }, [queries, updateCursors])

    return useMemo(
        () => ({
            refresh: () => {
                const predicate = (query: Query) => {
                    return (
                        query.queryKey[0] === "raidhub" &&
                        query.queryKey[1] === "player" &&
                        query.queryKey[2] === "activities" &&
                        membershipIds.includes(query.queryKey[3] as string) &&
                        query.queryKey[4] === ""
                    )
                }

                void Promise.all([
                    // Resetting will set the status to loading
                    queryClient.resetQueries({
                        predicate
                    }),
                    queryClient.refetchQueries({
                        predicate
                    })
                ])
            },
            activities: queries.some(q => q.isLoading)
                ? new Collection()
                : new Collection(
                      queries
                          .flatMap(q => q.data?.activities ?? [])
                          .sort(
                              (a, b) =>
                                  new Date(b.dateCompleted).getTime() -
                                  new Date(a.dateCompleted).getTime()
                          )
                          .map(a => [a.instanceId, a])
                  ),
            isLoading: queries.length === 0 || queries.some(q => q.isLoading)
        }),
        [membershipIds, queries, queryClient]
    )
}
