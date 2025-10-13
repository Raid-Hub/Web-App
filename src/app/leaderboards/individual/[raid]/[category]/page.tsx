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
    params: PathParamsForLeaderboardURL<"/leaderboard/individual/raid/{raid}/{category}">
    searchParams: Record<string, string>
}

const getCategoryName = (category: DynamicParams["params"]["category"]) => {
    switch (category) {
        case "clears":
            return "Clears"
        case "freshClears":
            return "Full Clears"
        case "sherpas":
            return "Sherpas"
        default:
            return "Unknown Category"
    }
}

export async function generateMetadata({ params }: DynamicParams): Promise<Metadata> {
    const manifest = await prefetchManifest()
    const definition = getRaidDefinition(params.raid, manifest)
    const categoryName = getCategoryName(params.category)

    const title = `${definition.name} ${categoryName} Leaderboard`
    const description = `View the ${categoryName.toLowerCase()} leaderboard for ${definition.name}.`

    return {
        title: title,
        description: description,
        keywords: [...baseMetadata.keywords, definition.name, categoryName, "top", "rankings"],
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
    const categoryName = getCategoryName(params.category)

    return (
        <Leaderboard
            heading={
                <Splash
                    title={categoryName}
                    subtitle={definition.name}
                    tertiaryTitle="Individual Leaderboards">
                    <CloudflareActivitySplash activityId={definition.id} fill className="z-[-1]" />
                </Splash>
            }
            hasPages
            hasSearch
            external={false}
            pageProps={{
                layout: "individual",
                queryKey: ["raidhub", "leaderboard", "individual", params.raid, params.category],
                entriesPerPage: 50,
                apiUrl: "/leaderboard/individual/raid/{raid}/{category}",
                params
            }}
            entries={
                <LeaderboardSSR
                    page={searchParams.page ?? "1"}
                    entriesPerPage={50}
                    apiUrl="/leaderboard/individual/raid/{raid}/{category}"
                    params={params}
                />
            }
        />
    )
}
