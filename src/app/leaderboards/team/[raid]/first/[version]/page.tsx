import { type Metadata } from "next"
import { LeaderboardSSR } from "~/app/leaderboards/LeaderboardSSR"
import NotFound from "~/app/not-found"
import { CloudflareActivitySplash } from "~/components/CloudflareImage"
import { findPantheonVersionByPath } from "~/lib/manifest/pantheon"
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

const tryGetDefinitions = (params: DynamicParams["params"], manifest: RaidHubManifestResponse) => {
    if (params.raid === "pantheon") {
        const version = findPantheonVersionByPath(manifest, params.version)
        if (!version?.associatedActivityId) {
            return null
        }

        const activity = manifest.activityDefinitions[version.associatedActivityId] ?? null
        if (!activity) {
            return null
        }

        return { version, activity, isPantheon: true as const }
    }

    const version = Object.values(manifest.versionDefinitions).find(
        def => def.path === params.version
    )
    const activity = Object.values(manifest.activityDefinitions).find(
        def => def.path === params.raid
    )

    if (!version || !activity) {
        return null
    }

    return {
        version,
        activity,
        isPantheon: false as const
    }
}

const getDefinitions = (params: DynamicParams["params"], manifest: RaidHubManifestResponse) => {
    return tryGetDefinitions(params, manifest)
}

export async function generateMetadata({ params }: DynamicParams): Promise<Metadata> {
    const manifest = await prefetchManifest()
    const definitions = tryGetDefinitions(params, manifest)
    if (!definitions) {
        return {}
    }

    const { version, activity, isPantheon } = definitions

    const title = isPantheon
        ? `${activity.name}: ${version.name} First Completions Leaderboard`
        : `${version.name} ${activity.name} First Completions Leaderboard`
    const description = isPantheon
        ? `View the first completions for ${version.name} in ${activity.name}`
        : `View the first completions for ${version.name} ${activity.name}`

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
    const definitions = getDefinitions(params, manifest)
    if (!definitions) {
        return <NotFound />
    }

    const { version, activity, isPantheon } = definitions

    return (
        <Leaderboard
            heading={
                <Splash
                    tertiaryTitle={isPantheon ? activity.name : "First Completion Leaderboards"}
                    title={isPantheon ? version.name : "First Completions Leaderboard"}
                    subtitle={
                        isPantheon
                            ? "First Completions Leaderboard"
                            : `${version.name} ${activity.name}`
                    }>
                    <CloudflareActivitySplash
                        activityId={isPantheon ? version.associatedActivityId! : activity.id}
                        versionId={isPantheon ? version.id : undefined}
                        fill
                        className="z-[-1]"
                    />
                </Splash>
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
