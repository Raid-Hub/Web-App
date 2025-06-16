import { type QueryKey } from "@tanstack/react-query"
import { Suspense, type ReactNode } from "react"
import { PageWrapper } from "~/components/PageWrapper"
import { Flex } from "~/components/__deprecated__/layout/Flex"
import {
    type PathParamsForLeaderboardURL,
    type RaidHubLeaderboardURL
} from "~/services/raidhub/types"
import { LeaderboardControls } from "./LeaderboardControls"
import { LeaderboardEntriesSuspense } from "./LeaderboardEntriesSuspense"

export type PageProps<T extends RaidHubLeaderboardURL, X extends boolean = false> = {
    entriesPerPage: number
    layout: "team" | "individual"
    queryKey: QueryKey
} & (X extends false ? { apiUrl: T; params: PathParamsForLeaderboardURL<T> } : unknown)

export const Leaderboard = <T extends RaidHubLeaderboardURL, X extends boolean>(props: {
    heading: ReactNode
    entries: ReactNode
    extraControls?: ReactNode
    hasPages: boolean
    hasSearch: boolean
    external: X
    pageProps: PageProps<T, X>
}) => {
    return (
        <PageWrapper $maxWidth={2000} pageProps={props.pageProps}>
            <Flex $padding={0}>
                <Flex $direction="column" $padding={0} $gap={1.5}>
                    <div style={{ minWidth: "calc(min(95%, 500px))" }}>
                        {props.heading}
                        <Flex $padding={0} $relative>
                            {/* Required to suspend because of the useSearchParams() hook */}
                            <Suspense>
                                {props.extraControls}
                                <LeaderboardControls
                                    hasPages={props.hasPages}
                                    hasSearch={props.hasSearch}
                                />
                            </Suspense>
                        </Flex>
                    </div>
                    <LeaderboardEntriesSuspense>{props.entries}</LeaderboardEntriesSuspense>
                </Flex>
            </Flex>
        </PageWrapper>
    )
}
