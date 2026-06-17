import { notFound } from "next/navigation"
import { RaidHubError } from "~/services/raidhub/RaidHubError"
import { getRaidHubApi } from "~/services/raidhub/common"
import {
    type PathParamsForLeaderboardURL,
    type RaidHubLeaderboardURL,
    type ResponseForLeaderboardURL
} from "~/services/raidhub/types"
import { LeaderboardProvider } from "./LeaderboardProvider"

export const LeaderboardSSR = async <T extends RaidHubLeaderboardURL>(props: {
    entriesPerPage: number
    page: string
    apiUrl: T
    params: PathParamsForLeaderboardURL<T>
}) => {
    const isFirstpage = props.page === "1"
    const ssrData = isFirstpage
        ? await (
              getRaidHubApi<T>(
                  props.apiUrl,
                  // @ts-expect-error generic hell
                  props.params,
                  {
                      page: 1,
                      count: props.entriesPerPage
                  }
              ) as Promise<ResponseForLeaderboardURL<T>>
          ).catch(e => {
              if (e instanceof RaidHubError && e.errorCode === "PathValidationError") {
                  return "not-found" as const
              } else {
                  console.error(e)
              }
              return null
          })
        : null

    if (ssrData === "not-found") {
        notFound()
    }

    return (
        <LeaderboardProvider
            ssrData={ssrData?.response ?? null}
            ssrUpdatedAt={isFirstpage ? new Date(ssrData?.minted ?? Date.now()).getTime() : null}
            ssrPage={props.page}
        />
    )
}
