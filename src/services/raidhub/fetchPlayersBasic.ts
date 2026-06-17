import { postRaidHubApi } from "~/services/raidhub/common"
import { type RaidHubPlayerInfo } from "~/services/raidhub/types"

/** Resolve up to 12 players via `POST /player/basic/batch`. */
export async function fetchRaidHubPlayersBasic(
    membershipIds: readonly string[]
): Promise<RaidHubPlayerInfo[]> {
    if (!membershipIds.length) {
        return []
    }

    const uniqueIds = [...new Set(membershipIds)]
    const response = await postRaidHubApi(
        "/player/basic/batch",
        "post",
        { membershipIds: uniqueIds.slice(0, 12) },
        null
    )

    return [...response.response.players]
}

export function playersBasicByMembershipId(
    players: readonly RaidHubPlayerInfo[]
): Map<string, RaidHubPlayerInfo> {
    return new Map(players.map(player => [player.membershipId, player]))
}
