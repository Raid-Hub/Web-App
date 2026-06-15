import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { CloudflareStaticImage } from "~/components/CloudflareImage"
import { baseMetadata } from "~/lib/metadata"
import { type PathParamsForLeaderboardURL } from "~/services/raidhub/types"
import { Leaderboard } from "../../../Leaderboard"
import { LeaderboardSSR } from "../../../LeaderboardSSR"
import { Splash } from "../../../LeaderboardSplashComponents"

export const dynamicParams = true
export const revalidate = 900
export const dynamic = "force-static"
export const fetchCache = "default-no-store"

type CategoryParam =
    PathParamsForLeaderboardURL<"/leaderboard/individual/global/{category}">["category"]

const GLOBAL_CATEGORY_TITLES = {
    clears: "Clears",
    "full-clears": "Full Clears",
    sherpas: "Sherpas",
    speedrun: "Speedrun",
    "world-first-rankings": "World First Rating",
    "in-raid-time": "In Raid Time"
} as const satisfies Record<CategoryParam, string>

const tryGetCategoryTitle = (category: string) =>
    GLOBAL_CATEGORY_TITLES[category as CategoryParam] ?? null

const getCategoryTitle = (category: CategoryParam) => {
    const title = tryGetCategoryTitle(category)
    if (!title) {
        notFound()
    }
    return title
}

type DynamicParams = {
    params: {
        category: CategoryParam
    }
    searchParams: Record<string, string>
}

export async function generateMetadata({ params }: DynamicParams): Promise<Metadata> {
    const categoryName = tryGetCategoryTitle(params.category)
    if (!categoryName) {
        return {}
    }
    const title = `${categoryName} Leaderboards`
    const description = `View the Destiny 2 raid ${categoryName.toLowerCase()} leaderboard`

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
    const categoryName = getCategoryTitle(params.category)

    const apiParams = {
        category: params.category
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
                <Splash title={categoryName} tertiaryTitle="Global Leaderboards">
                    <CloudflareStaticImage
                        cloudflareId="raidhubCitySplash"
                        className="z-[-1]"
                        fill
                    />
                </Splash>
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
