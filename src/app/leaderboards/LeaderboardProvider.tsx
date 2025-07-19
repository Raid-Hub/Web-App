"use client"

import { useMemo } from "react"
import { usePageProps } from "~/components/PageWrapper"
import { usePage } from "~/hooks/util/usePage"
import { getRaidHubApi } from "~/services/raidhub/common"
import { type RaidHubLeaderboardData, type RaidHubLeaderboardURL } from "~/services/raidhub/types"
import { bungieIconUrl, getBungieDisplayName } from "~/util/destiny"
import { type PageProps } from "./Leaderboard"
import { LeaderboardEntriesLoadingWrapper } from "./LeaderboardEntriesLoadingWrapper"
import { useLeaderboard } from "./useLeaderboard"

export const LeaderboardProvider = <T extends RaidHubLeaderboardURL>(props: {
    ssrPage: string
    ssrUpdatedAt: number | null
    ssrData: RaidHubLeaderboardData | null
}) => {
    const page = usePage()
    const { entriesPerPage, queryKey, apiUrl, params } = usePageProps<PageProps<T>>()

    const queryKeyWithPage = useMemo(() => [...queryKey, page], [queryKey, page])

    const query = useLeaderboard({
        // The SSR page may not be the same as the current page, so we need to check
        initialData: props.ssrPage === String(page) ? (props.ssrData ?? undefined) : undefined,
        initialDataUpdatedAt: props.ssrUpdatedAt ?? undefined,
        queryKey: queryKeyWithPage,
        queryFn: () =>
            // @ts-expect-error generic hell
            getRaidHubApi(
                apiUrl,
                // @ts-expect-error generic hell
                params,
                {
                    page: page,
                    count: entriesPerPage
                }
            ).then(res => res.response),
        select: data =>
            data.type === "team"
                ? data.entries.map(e => ({
                      id: e.instanceId,
                      type: "team",
                      position: e.position,
                      rank: e.rank,
                      url: `/pgcr/${e.instanceId}`,
                      value: e.value,
                      valueFormat: data.format,
                      team: e.players.map(player => ({
                          id: player.membershipId,
                          displayName: getBungieDisplayName(player, { excludeCode: true }),
                          iconUrl: bungieIconUrl(player.iconPath)
                      }))
                  }))
                : data.entries.map(e => ({
                      id: e.playerInfo.membershipId,
                      type: "player",
                      position: e.position,
                      rank: e.rank,
                      value: e.value,
                      valueFormat: data.format,
                      player: {
                          id: e.playerInfo.membershipId,
                          displayName: getBungieDisplayName(e.playerInfo, { excludeCode: true }),
                          url: `/profile/${e.playerInfo.membershipId}`,
                          iconUrl: bungieIconUrl(e.playerInfo.iconPath)
                      }
                  }))
    })

    return <LeaderboardEntriesLoadingWrapper {...query} />
}
