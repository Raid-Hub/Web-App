import { type Metadata } from "next"
import { LeaderboardSSR } from "~/app/leaderboards/LeaderboardSSR"
import { CloudflareActivitySplash } from "~/components/CloudflareImage"
import { baseMetadata } from "~/lib/metadata"
import { prefetchManifest } from "~/services/raidhub/prefetchRaidHubManifest"
import { type PathParamsForLeaderboardURL } from "~/services/raidhub/types"
import { Leaderboard } from "../../../Leaderboard"
import { Splash } from "../../../LeaderboardSplashComponents"
import { getRaidDefinition } from "../../../util"

export const dynamicParams = true
export const revalidate = 900
export const dynamic = "force-static"
export const fetchCache = "default-no-store"

type DynamicParams = {
    params: PathParamsForLeaderboardURL<"/leaderboard/team/contest/{raid}">
    searchParams: Record<string, string>
}

export async function generateMetadata({ params }: DynamicParams): Promise<Metadata> {
    const manifest = await prefetchManifest()
    const definition = getRaidDefinition(params.raid, manifest)

    const title = `${definition.name} World First Leaderboard`
    const description = `View the World First completions for ${definition.name}`
    return {
        title: title,
        description: description,
        keywords: [
            definition.name,
            "world first",
            "race",
            "placements",
            "rankings",
            ...baseMetadata.keywords
        ],
        openGraph: {
            ...baseMetadata.openGraph,
            title: title,
            description: description
        }
    }
}

export default async function Page({ params, searchParams }: DynamicParams) {
    const manifest = await prefetchManifest()
    const definition = getRaidDefinition(params.raid, manifest)

    return (
        <Leaderboard
            heading={
                <Splash
                    title={definition.name}
                    subtitle={
                        manifest.resprisedRaidIds.includes(definition.id)
                            ? "Challenge"
                            : manifest.contestRaidIds.includes(definition.id)
                              ? "Contest"
                              : "Normal"
                    }
                    tertiaryTitle="World First Leaderboards">
                    <CloudflareActivitySplash activityId={definition.id} fill className="z-[-1]" />
                </Splash>
            }
            hasPages
            hasSearch
            external={false}
            pageProps={{
                layout: "team",
                queryKey: ["raidhub", "leaderboard", "worldfirst", params.raid],
                entriesPerPage: 50,
                apiUrl: "/leaderboard/team/contest/{raid}",
                params
            }}
            entries={
                <LeaderboardSSR
                    page={searchParams.page ?? "1"}
                    entriesPerPage={50}
                    apiUrl="/leaderboard/team/contest/{raid}"
                    params={params}
                />
            }
        />
    )
}
