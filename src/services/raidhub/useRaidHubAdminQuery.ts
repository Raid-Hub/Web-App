import { useMutation } from "@tanstack/react-query"
import { useCallback, useRef } from "react"
import { toast } from "sonner"
import { useSession } from "~/hooks/app/useSession"
import type { RaidHubAdminQueryBody } from "~/services/raidhub/types"
import { postRaidHubApi } from "./common"

export const useRaidHubAdminQuery = () => {
    const abortController = useRef(new AbortController())
    const session = useSession()

    const mutation = useMutation({
        mutationKey: ["raidhub", "admin", "query"] as const,
        mutationFn: (body: RaidHubAdminQueryBody) =>
            postRaidHubApi("/admin/query", "post", body, null, null, {
                headers: session.data?.raidHubAccessToken?.value
                    ? {
                          Authorization: "Bearer " + session.data.raidHubAccessToken.value
                      }
                    : {},
                signal: abortController.current.signal
            }).then(res => res.response),
        onError: error => {
            if (error instanceof Error && error.name === "AbortError") {
                toast.info("Query cancelled")
            }
        }
    })

    const cancel = useCallback(() => {
        abortController.current.abort()
        // Create a new AbortController for the next query
        abortController.current = new AbortController()
    }, [abortController])

    return { mutation, cancel }
}
