import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { LeaderboardSSR } from "~/app/leaderboards/LeaderboardSSR"
import { baseMetadata } from "~/lib/metadata"
import { prefetchManifest } from "~/services/raidhub/prefetchRaidHubManifest"
import {
    type PathParamsForLeaderboardURL,
    type RaidHubManifestResponse
} from "~/services/raidhub/types"
import { Leaderboard } from "../../../../Leaderboard"
import { Splash } from "../../../../LeaderboardSplashComponents"

export const dynamicParams = true
export const revalidate = 900
export const dynamic = "force-static"
export const fetchCache = "default-no-store"

type PantheonVersionLeaderboardDynamicParams = {
    params: PathParamsForLeaderboardURL<"/leaderboard/individual/pantheon/{version}/{category}">
    searchParams: Record<string, string>
}

const getDefinitions = (
    params: PantheonVersionLeaderboardDynamicParams["params"],
    manifest: RaidHubManifestResponse
) => {
    const definition = Object.values(manifest.versionDefinitions).find(
        data => data.associatedActivityId === 101 && data.path === params.version
    )

    if (!definition) {
        return notFound()
    } else {
        return {
            definition,
            categoryName: params.category[0].toUpperCase() + params.category.slice(1)
        }
    }
}

export async function generateMetadata({
    params
}: PantheonVersionLeaderboardDynamicParams): Promise<Metadata> {
    const manifest = await prefetchManifest()
    const { definition, categoryName } = getDefinitions(params, manifest)

    const title = `The Pantheon: ${definition.name} ${categoryName} Completion Leaderboard`
    const description = `View the Pantheon: ${
        definition.name
    } ${categoryName.toLowerCase()} leaderboards`

    return {
        title: title,
        description: description,
        keywords: [
            ...baseMetadata.keywords,
            categoryName,
            "pantheon",
            definition.name,
            "top",
            "rankings"
        ],
        openGraph: {
            ...baseMetadata.openGraph,
            title: title,
            description: description
        }
    }
}

export default async function Page({
    params,
    searchParams
}: PantheonVersionLeaderboardDynamicParams) {
    const manifest = await prefetchManifest()
    const { definition, categoryName } = getDefinitions(params, manifest)

    return (
        <Leaderboard
            heading={
                <Splash
                    tertiaryTitle="The Pantheon"
                    title={definition.name}
                    subtitle={`${categoryName} Leaderboard`}
                    cloudflareImageId="pantheonSplash"
                />
            }
            hasPages
            hasSearch
            external={false}
            pageProps={{
                layout: "individual",
                queryKey: ["raidhub", "leaderboard", "pantheon", params.version, params.category],
                entriesPerPage: 50,
                apiUrl: "/leaderboard/individual/pantheon/{version}/{category}",
                params
            }}
            entries={
                <LeaderboardSSR
                    page={searchParams.page ?? "1"}
                    entriesPerPage={50}
                    apiUrl="/leaderboard/individual/pantheon/{version}/{category}"
                    params={params}
                />
            }
        />
    )
}
