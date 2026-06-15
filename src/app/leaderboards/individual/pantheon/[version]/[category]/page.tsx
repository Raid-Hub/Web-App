import { type Metadata } from "next"
import NotFound from "~/app/not-found"
import { LeaderboardSSR } from "~/app/leaderboards/LeaderboardSSR"
import { CloudflareActivitySplash } from "~/components/CloudflareImage"
import { findPantheonVersionByPath } from "~/lib/manifest/pantheon"
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

const tryGetDefinitions = (
    params: PantheonVersionLeaderboardDynamicParams["params"],
    manifest: RaidHubManifestResponse
) => {
    const definition = findPantheonVersionByPath(manifest, params.version)

    if (!definition?.associatedActivityId) {
        return null
    }

    const activity = manifest.activityDefinitions[definition.associatedActivityId] ?? null

    return {
        definition,
        activity,
        categoryName: params.category[0].toUpperCase() + params.category.slice(1)
    }
}

const getDefinitions = (
    params: PantheonVersionLeaderboardDynamicParams["params"],
    manifest: RaidHubManifestResponse
) => {
    return tryGetDefinitions(params, manifest)
}

export async function generateMetadata({
    params
}: PantheonVersionLeaderboardDynamicParams): Promise<Metadata> {
    const manifest = await prefetchManifest()
    const definitions = tryGetDefinitions(params, manifest)
    if (!definitions) {
        return {}
    }

    const { definition, activity, categoryName } = definitions
    const activityName = activity?.name ?? "The Pantheon"

    const title = `${activityName}: ${definition.name} ${categoryName} Completion Leaderboard`
    const description = `View the ${activityName}: ${
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
    const definitions = getDefinitions(params, manifest)
    if (!definitions) {
        return <NotFound />
    }

    const { definition, activity, categoryName } = definitions

    return (
        <Leaderboard
            heading={
                <Splash
                    tertiaryTitle={activity?.name ?? "The Pantheon"}
                    title={definition.name}
                    subtitle={`${categoryName} Leaderboard`}>
                    <CloudflareActivitySplash
                        activityId={definition.associatedActivityId!}
                        versionId={definition.id}
                        fill
                        className="z-[-1]"
                    />
                </Splash>
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
