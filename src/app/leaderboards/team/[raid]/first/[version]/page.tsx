import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { LeaderboardSSR } from "~/app/leaderboards/LeaderboardSSR"
import { getRaidSplash } from "~/lib/activity-images"
import { baseMetadata } from "~/lib/metadata"
import { prefetchManifest } from "~/services/raidhub/prefetchRaidHubManifest"
import { type RaidHubManifestResponse } from "~/services/raidhub/types"
import { Leaderboard } from "../../../../Leaderboard"
import { Splash } from "../../../../LeaderboardSplashComponents"

export const dynamicParams = true
export const revalidate = 900
export const dynamic = "force-static"
export const fetchCache = "default-no-store"

type DynamicParams = {
    params: {
        raid: string
        version: string
    }
    searchParams: Record<string, string>
}

const getDefinitions = (params: DynamicParams["params"], manifest: RaidHubManifestResponse) => {
    return {
        version:
            Object.values(manifest.versionDefinitions).find(def => def.path === params.version) ??
            notFound(),
        activity:
            Object.values(manifest.activityDefinitions).find(def => def.path === params.raid) ??
            notFound()
    }
}

export async function generateMetadata({ params }: DynamicParams): Promise<Metadata> {
    const manifest = await prefetchManifest()
    const { version, activity } = getDefinitions(params, manifest)

    const title = `${version.name} ${activity.name} First Completions Leaderboard`
    const description = `View the first completions for ${version.name} ${activity.name}`

    return {
        title: title,
        description: description,
        keywords: [
            activity.name,
            version.name,
            "world first",
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
    const { version, activity } = getDefinitions(params, manifest)
    return (
        <Leaderboard
            heading={
                <Splash
                    title="First Completions Leaderboard"
                    subtitle={`${version.name} ${activity.name}`}
                    tertiaryTitle="First Completion Leaderboards"
                    cloudflareImageId={getRaidSplash(activity.path) ?? "pantheonSplash"}
                />
            }
            hasPages
            hasSearch
            external={false}
            pageProps={{
                layout: "team",
                queryKey: ["raidhub", "leaderboard", "first", params.raid, params.version],
                entriesPerPage: 50,
                apiUrl: "/leaderboard/team/first/{activity}/{version}",
                params: {
                    activity: params.raid,
                    version: params.version
                }
            }}
            entries={
                <LeaderboardSSR
                    page={searchParams.page ?? "1"}
                    entriesPerPage={50}
                    apiUrl="/leaderboard/team/first/{activity}/{version}"
                    params={{
                        activity: params.raid,
                        version: params.version
                    }}
                />
            }
        />
    )
}
