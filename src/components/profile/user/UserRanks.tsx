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
                    title="Contest Score"
                    value={(playerQuery.data.stats.global.contest?.value ?? 0).toFixed(2)}
                    rank={playerQuery.data.stats.global.contest?.rank ?? -1}
                    percentile={playerQuery.data.stats.global.contest?.percentile ?? 0}
                />
                <StatCard
                    title="Full Clears"
                    value={(playerQuery.data.stats.global.freshClears?.value ?? 0).toLocaleString()}
                    rank={playerQuery.data.stats.global.freshClears?.rank ?? -1}
                    percentile={playerQuery.data.stats.global.freshClears?.percentile ?? 0}
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
                    rank={playerQuery.data.stats.global.sumOfBest?.rank ?? -1}
                    percentile={playerQuery.data.stats.global.sumOfBest?.percentile ?? 0}
                />
                <StatCard
                    title="Sherpas"
                    value={(playerQuery.data.stats.global.sherpas?.value ?? 0).toLocaleString()}
                    rank={playerQuery.data.stats.global.sherpas?.rank ?? -1}
                    percentile={playerQuery.data.stats.global.sherpas?.percentile ?? 0}
                />
                <StatCard
                    title="In Raid Time"
                    value={secondsToYDHMS(
                        playerQuery.data.stats.global.totalTimePlayed?.value ?? 0,
                        3
                    )}
                    rank={playerQuery.data.stats.global.totalTimePlayed?.rank ?? -1}
                    percentile={playerQuery.data.stats.global.totalTimePlayed?.percentile ?? 0}
                />
            </div>
        )
    )
}

const StatCard = ({
    title,
    rank,
    value,
    percentile
}: {
    title?: string
    rank: number
    percentile: number
    value?: string
}) => {
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
                tierName: `#${rank}`,
                tierColor: "bg-pink-500/80"
            }

        for (const split of rankingTiers) {
            if (percentile >= split.minPercentile) {
                return split
            }
        }

        return rankingTiers[rankingTiers.length - 1]
    }, [rank, percentile, rankingTiers])
    return (
        <div className={cn("border-1 bg-black/20 px-3 py-2 text-gray-200 shadow-md", tierColor)}>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-lg font-light">{tierName}</p>
            <p className="text-sm">{value}</p>
        </div>
    )
}
