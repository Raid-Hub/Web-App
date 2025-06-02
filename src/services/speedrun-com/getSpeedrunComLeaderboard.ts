import {
    SpeedrunVariables,
    destiny2GameId,
    type RTABoardCategory
} from "~/lib/speedrun/speedrun-com-mappings"
import type { SpeedrunLeaderboardResponse } from "~/types/speedrun-com"
import { baseUrl } from "./baseUrl"

export async function getSpeedrunComLeaderboard(
    params: {
        raid: string
        category?: RTABoardCategory
    },
    init: Omit<RequestInit, "method"> = {}
) {
    const { categoryId, variable } = SpeedrunVariables[params.raid] ?? {}
    if (!categoryId) {
        throw new Error("Category ID not found")
    }

    const url = new URL(`/api/v1/leaderboards/${destiny2GameId}/category/${categoryId}`, baseUrl)
    url.searchParams.append("embed", "players")

    if (variable && params.category) {
        const key = `var-${variable.variableId}`
        const value = variable.values[params.category]?.id
        if (!value) throw new Error(`Invalid static category: ${params.category}`)

        url.searchParams.append(key, value)
    }

    const res = await fetch(url, {
        method: "GET",
        ...init
    })

    if (res.ok) {
        const { data } = (await res.json()) as SpeedrunLeaderboardResponse
        return data
    } else {
        throw new Error(
            "Invalid Speedrun.com response. Status: " + res.status + " " + res.statusText
        )
    }
}
