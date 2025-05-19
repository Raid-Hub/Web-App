"use client"

import { usePageProps } from "~/components/layout/PageWrapper"
import { usePage } from "~/hooks/util/usePage"
import { type RaidHubLeaderboardURL } from "~/services/raidhub/types"
import { type PageProps } from "./Leaderboard"
import { LeaderboardEntries } from "./LeaderboardEntries"

export const LeaderboardEntriesLoading = () => {
    const page = usePage()
    const { entriesPerPage, layout } = usePageProps<PageProps<RaidHubLeaderboardURL>>()

    return (
        <LeaderboardEntries
            entries={Array.from({ length: entriesPerPage }, (_, idx) => ({
                id: String(idx),
                position: (page - 1) * entriesPerPage + idx + 1,
                rank: (page - 1) * entriesPerPage + idx + 1,
                value: 0,
                valueFormat: "numerical",
                ...(layout === "individual"
                    ? {
                          type: "player",
                          player: {
                              id: "0",
                              displayName: "Loading..."
                          }
                      }
                    : {
                          type: "team",
                          team: Array.from({ length: 6 }, (_, idx) => ({
                              id: String(idx),
                              displayName: "Loading..."
                          }))
                      })
            }))}
        />
    )
}
