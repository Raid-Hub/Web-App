import { type RaidHubInstancePlayerExtended } from "~/services/raidhub/types"
import { round } from "~/util/math"

export function generateSortScore(d: RaidHubInstancePlayerExtended) {
    const stats = d.characters.reduce(
        (acc, c) => ({
            kills: acc.kills + c.kills,
            deaths: acc.deaths + c.deaths,
            assists: acc.assists + c.assists,
            precisionKills: acc.precisionKills + c.precisionKills,
            superKills: acc.superKills + c.superKills,
            score: acc.score + c.score
        }),
        {
            kills: 0,
            deaths: 0,
            assists: 0,
            precisionKills: 0,
            superKills: 0,
            score: 0
        }
    )

    const adjustedTimePlayedSeconds = Math.min(d.timePlayedSeconds || 1, 32767)
    // kills weighted 2x assists, slight diminishing returns
    const killScore =
        (200 * (stats.kills + 0.5 * stats.assists) ** 0.95) /
            (round(adjustedTimePlayedSeconds, -1) || 1) +
        stats.kills / 600

    // a multiplier based on your time per deaths ^ 1.5, normalized a bit by using deaths + 7
    const deathScore = (((1 / 6) * adjustedTimePlayedSeconds) / (stats.deaths + 7)) ** 1.5 / 3

    const kdScore = killScore * deathScore

    const timeScore = 50 * (adjustedTimePlayedSeconds / 3600) // 50 points per hour

    const precisionScore = 3 * (stats.precisionKills / (stats.kills || 1)) * 10 // 3 points per 10% of kills

    const superScore = (stats.superKills / (adjustedTimePlayedSeconds / 60)) * 15 // 15 points per super kill per minute

    const assistScore = ((stats.assists / (stats.kills || 1)) * Math.min(300, stats.kills)) / 2 // max of 2 points per 10% of kills

    const startScore = d.characters.find(
        c => c.startSeconds < Math.max(30, d.timePlayedSeconds / 50)
    )
        ? 20
        : 0 // 20 points for starting the raid

    const scoreScore = 0.5 * (stats.score / 1000) // 0.5 points per 1000 score

    const raidhubScore =
        kdScore + assistScore + timeScore + precisionScore + superScore + startScore + scoreScore

    return raidhubScore
}
