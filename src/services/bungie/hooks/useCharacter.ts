import { useQuery } from "@tanstack/react-query"
import { getCharacter } from "bungie-net-core/endpoints/Destiny2"
import { type BungieMembershipType } from "bungie-net-core/models"
import type { DestinyCharacterResponse } from "bungie-net-core/models/Destiny/Responses/DestinyCharacterResponse"
import { useBungieClient } from "~/components/providers/session/BungieClientProvider"

export const useCharacter = <T = DestinyCharacterResponse<[200]>>(
    params: {
        destinyMembershipId: string
        membershipType: BungieMembershipType
        characterId: string
    },
    opts?: {
        enabled?: boolean
        staleTime?: number
        select?: (data: DestinyCharacterResponse<[200]>) => T
        placeholderData?: DestinyCharacterResponse<[200]> | (() => DestinyCharacterResponse<[200]>)
        retry?: boolean | number
    }
) => {
    const bungieClient = useBungieClient()

    return useQuery({
        queryKey: [
            "bungie",
            "character",
            params.destinyMembershipId,
            params.membershipType,
            params.characterId
        ] as const,
        queryFn: ({ queryKey }) =>
            getCharacter(bungieClient, {
                destinyMembershipId: queryKey[2],
                membershipType: queryKey[3],
                characterId: queryKey[4],
                components: [200]
            }).then(res => {
                if (!res.Response.character) {
                    throw new Error(`Character ${queryKey[4]} not found`)
                }
                return res.Response
            }),
        ...opts
    })
}
