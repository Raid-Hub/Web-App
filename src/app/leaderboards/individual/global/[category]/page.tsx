import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { baseMetadata } from "~/lib/metadata"
import { type PathParamsForLeaderboardURL } from "~/services/raidhub/types"
import { Leaderboard } from "../../../Leaderboard"
import { LeaderboardSSR } from "../../../LeaderboardSSR"
import { Splash } from "../../../LeaderboardSplashComponents"

export const dynamicParams = true
export const revalidate = 900
export const dynamic = "force-static"
export const fetchCache = "default-no-store"

const getCategoryInfo = (
    category: DynamicParams["params"]["category"]
): [
    string,
    PathParamsForLeaderboardURL<"/leaderboard/individual/global/{category}">["category"]
] => {
    switch (category) {
        case "clears":
            return ["Clears", "clears"]
        case "full-clears":
            return ["Full Clears", "freshClears"]
        case "sherpas":
            return ["Sherpas", "sherpas"]
        case "speedrun":
            return ["Speedrun", "speedrun"]
        case "contest-power-rankings":
            return ["Contest Power Rankings", "powerRankings"]
        default:
            notFound()
    }
}

type DynamicParams = {
    params: {
        category: "clears" | "full-clears" | "sherpas" | "speedrun" | "contest-power-rankings"
    }
    searchParams: Record<string, string>
}

export async function generateMetadata({ params }: DynamicParams): Promise<Metadata> {
    const [categoryName] = getCategoryInfo(params.category)
    const title = `${categoryName} Leaderboards`
    const description = `View the ${categoryName.toLowerCase()} global leaderboard`

    return {
        title: title,
        description: description,
        keywords: [...baseMetadata.keywords, categoryName, "top", "rankings"],
        openGraph: {
            ...baseMetadata.openGraph,
            title: title,
            description: description
        }
    }
}

const ENTRIES_PER_PAGE = 50

export default async function Page({ params, searchParams }: DynamicParams) {
    const [categoryName, category] = getCategoryInfo(params.category)

    const apiParams = {
        category
    }

    return (
        <Leaderboard
            pageProps={{
                entriesPerPage: ENTRIES_PER_PAGE,
                layout: "individual",
                queryKey: ["raidhub", "leaderboard", "global", params.category],
                apiUrl: "/leaderboard/individual/global/{category}",
                params: apiParams
            }}
            hasSearch
            hasPages
            external={false}
            heading={
                <Splash
                    title={categoryName}
                    tertiaryTitle="Global Leaderboards"
                    cloudflareImageId="raidhubCitySplash"
                />
            }
            entries={
                <LeaderboardSSR
                    page={searchParams.page ?? "1"}
                    entriesPerPage={ENTRIES_PER_PAGE}
                    apiUrl="/leaderboard/individual/global/{category}"
                    params={apiParams}
                />
            }
        />
    )
}
