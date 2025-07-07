import Link from "next/link"
import { useMemo } from "react"
import { usePageProps } from "~/components/PageWrapper"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { type ProfileProps } from "~/lib/profile/types"
import { cn } from "~/lib/tw"
import { useRaidHubPlayer } from "~/services/raidhub/useRaidHubPlayers"
import { secondsToHMS, secondsToYDHMS } from "~/util/presentation/formatting"

export const UserRanks = () => {
    const { destinyMembershipId } = usePageProps<ProfileProps>()
    const playerQuery = useRaidHubPlayer(destinyMembershipId)

    return (
        playerQuery.data && (
            <div className="grid grid-cols-5 gap-3 max-sm:grid-cols-2">
                <StatCard
                    title="WFR Score"
                    leaderboardPath="world-first-rankings"
                    value={(playerQuery.data.stats.global.contest?.value ?? 0).toFixed(3)}
                    rank={playerQuery.data.stats.global.contest.rank ?? -1}
                    percentile={playerQuery.data.stats.global.contest.percentile ?? 0}
                />
                <StatCard
                    title="Full Clears"
                    leaderboardPath="full-clears"
                    value={(playerQuery.data.stats.global.freshClears?.value ?? 0).toLocaleString()}
                    rank={playerQuery.data.stats.global.freshClears.rank ?? -1}
                    percentile={playerQuery.data.stats.global.freshClears.percentile ?? 0}
                />
                {/* <StatCard
                    title="Clears"
                    value={playerQuery.data.stats.global.clears.value.toLocaleString()}
                    rank={playerQuery.data.stats.global.clears.rank}
                    percentile={0.985}
                /> */}

                <StatCard
                    title="Speed Rank"
                    value={
                        playerQuery.data.stats.global.sumOfBest?.value
                            ? secondsToHMS(playerQuery.data.stats.global.sumOfBest.value, true)
                            : "--:--"
                    }
                    rank={playerQuery.data.stats.global.sumOfBest.rank ?? -1}
                    percentile={playerQuery.data.stats.global.sumOfBest.percentile ?? 0}
                />
                <StatCard
                    title="Sherpas"
                    leaderboardPath="sherpas"
                    value={(playerQuery.data.stats.global.sherpas?.value ?? 0).toLocaleString()}
                    rank={playerQuery.data.stats.global.sherpas.rank ?? -1}
                    percentile={playerQuery.data.stats.global.sherpas.percentile ?? 0}
                />
                <StatCard
                    title="In Raid Time"
                    leaderboardPath="in-raid-time"
                    value={secondsToYDHMS(
                        playerQuery.data.stats.global.totalTimePlayed?.value ?? 0,
                        3
                    )}
                    rank={playerQuery.data.stats.global.totalTimePlayed.rank ?? -1}
                    percentile={playerQuery.data.stats.global.totalTimePlayed.percentile ?? 0}
                />
            </div>
        )
    )
}

const StatCard = ({
    title,
    rank,
    value,
    percentile,
    leaderboardPath
}: {
    title?: string
    rank: number
    percentile: number
    value?: string
    leaderboardPath?: string
}) => {
    const { destinyMembershipId } = usePageProps<ProfileProps>()
    const { rankingTiers } = useRaidHubManifest()
    const { tierName, tierColor } = useMemo(() => {
        if (rank == -1) {
            return {
                tierName: "Unranked",
                tierColor: "bg-gray-500/80"
            }
        }

        if (rank <= 500)
            return {
                tierName: (
                    <span>
                        Rank <b>#{rank}</b>
                    </span>
                ),
                tierColor: "bg-pink-500/80"
            }

        for (const split of rankingTiers) {
            if (percentile >= split.minPercentile) {
                return split
            }
        }

        return rankingTiers[rankingTiers.length - 1]
    }, [rank, percentile, rankingTiers])

    const Comp = leaderboardPath ? Link : "div"
    return (
        <Comp
            className={cn("border-1 bg-black/20 px-3 py-2 text-gray-200 shadow-md", tierColor)}
            href={`/leaderboards/individual/global/${leaderboardPath}?player=${destinyMembershipId}`}>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-lg font-light">{tierName}</p>
            <p className="text-sm font-semibold">{value}</p>
        </Comp>
    )
}
