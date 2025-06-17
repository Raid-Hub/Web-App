import { getRaidHubApi } from "./common"
import {
    type RaidHubIndividualGlobalLeaderboardCategory,
    type RaidHubLeaderboardPagination
} from "./types"

export async function getWorldFirstLeaderboard(raid: string, query: RaidHubLeaderboardPagination) {
    return getRaidHubApi(
        "/leaderboard/team/contest/{raid}",
        {
            raid
        },
        query
    )
}

export async function getActivityFirstLeaderboard(
    activity: string,
    version: string,
    query: RaidHubLeaderboardPagination
) {
    return getRaidHubApi(
        "/leaderboard/team/first/{activity}/{version}",
        {
            activity,
            version
        },
        query
    )
}

export async function getIndividualGlobalLeaderboard(
    category: RaidHubIndividualGlobalLeaderboardCategory,
    query: RaidHubLeaderboardPagination
) {
    return getRaidHubApi(
        "/leaderboard/individual/global/{category}",
        {
            category
        },
        query
    )
}

export async function getIndividualRaidLeaderboard(
    raid: string,
    category: "clears" | "freshClears" | "sherpas",
    query: RaidHubLeaderboardPagination
) {
    return getRaidHubApi(
        "/leaderboard/individual/raid/{raid}/{category}",
        {
            raid,
            category
        },
        query
    )
}

export async function getIndividualPantheonLeaderboard(
    version: string,
    category: "clears" | "freshClears" | "score",
    query: RaidHubLeaderboardPagination
) {
    return getRaidHubApi(
        "/leaderboard/individual/pantheon/{version}/{category}",
        {
            version,
            category
        },
        query
    )
}
