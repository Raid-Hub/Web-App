"use client"

import { type QueryKey } from "@tanstack/react-query"
import Image from "next/image"
import { LeaderboardEntriesLoadingWrapper } from "~/app/leaderboards/LeaderboardEntriesLoadingWrapper"
import { useLeaderboard } from "~/app/leaderboards/useLeaderboard"
import { SpeedrunPlacementIcons, type RTABoardCategory } from "~/lib/speedrun/speedrun-com-mappings"
import { getSpeedrunComLeaderboard } from "~/services/speedrun-com/getSpeedrunComLeaderboard"
import { o } from "~/util/o"
import { type LeaderboardEntry } from "../../../../LeaderboardEntries"

export const SpeedrunEntries = (props: {
    raidPath: string
    category?: RTABoardCategory
    queryKey: QueryKey
}) => {
    const query = useLeaderboard({
        queryKey: [...props.queryKey, 1],
        queryFn: () =>
            getSpeedrunComLeaderboard({
                raid: props.raidPath,
                category: props.category
            }),
        select: (
            data
        ): Extract<
            LeaderboardEntry,
            {
                type: "team"
            }
        >[] => {
            const playersDict = new Map(data?.players.data.map(p => [p.id, p]))
            return (
                data?.runs.map(({ place, run }) => ({
                    id: run.id,
                    type: "team",
                    rank: place,
                    value: run.times.primary_t,
                    position: place,
                    url: run.weblink,
                    valueFormat: "duration",
                    team: run.players.map(player => {
                        if (player.rel === "guest") {
                            return {
                                id: player.name,
                                displayName: player.name
                            }
                        }
                        const playerData = playersDict.get(player.id)!
                        return {
                            id: player.id,
                            displayName: playerData.names.international,
                            iconUrl: playerData.assets?.image?.uri ?? undefined,
                            url: playerData.weblink
                        }
                    })
                })) ?? []
            )
        }
    })

    return (
        <LeaderboardEntriesLoadingWrapper
            {...query}
            icons={o.mapValues(SpeedrunPlacementIcons.variants, (place, path) => (
                <Image
                    alt={place}
                    src={SpeedrunPlacementIcons.base + path}
                    unoptimized
                    width={30}
                    height={30}
                />
            ))}
        />
    )
}
