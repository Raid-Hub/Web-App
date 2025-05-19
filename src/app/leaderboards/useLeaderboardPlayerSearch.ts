import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { useQueryParams } from "~/hooks/util/useQueryParams"
import { type RaidHubLeaderboardData } from "~/services/raidhub/types"

export const useLeaderboardPlayerSearch = ({
    queryKeyWithoutPage,
    mutationFn
}: {
    mutationFn: (membershipId: string) => Promise<RaidHubLeaderboardData>
    queryKeyWithoutPage: QueryKey
}) => {
    const { tx, remove } = useQueryParams<{ page: string; position: string }>()
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: [...queryKeyWithoutPage, "search"],
        mutationFn: mutationFn,
        onMutate: () => {
            remove("position")
        },
        onSuccess: (data, q) => {
            const qk = Array.from(queryKeyWithoutPage)
            qk.push(data.page)

            queryClient.setQueryData<RaidHubLeaderboardData>(qk, data)

            const position = data.entries.find(e => {
                if ("playerInfo" in e) {
                    return e.playerInfo.membershipId === q
                } else {
                    return e.players.some(e => e.membershipId === q)
                }
            })?.position

            tx(
                ({ set }) => {
                    if (position) {
                        set("position", String(position))
                    } else {
                        alert(
                            "Player does not exist on the page they were found on. This is a bug. Please report it in our discord."
                        )
                    }
                    set("page", String(data.page))
                },
                {
                    history: true
                }
            )
        }
    })
}
