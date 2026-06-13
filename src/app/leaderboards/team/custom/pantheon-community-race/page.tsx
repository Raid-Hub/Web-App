import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { LeaderboardSSR } from "~/app/leaderboards/LeaderboardSSR"
import { CloudflareActivitySplash } from "~/components/CloudflareImage"
import { getActivePantheonIds, PANTHEON_COMMUNITY_RACE_VERSION_ID } from "~/lib/manifest/pantheon"
import { baseMetadata } from "~/lib/metadata"
import { prefetchManifest } from "~/services/raidhub/prefetchRaidHubManifest"
import { Leaderboard } from "../../../Leaderboard"
import { Splash } from "../../../LeaderboardSplashComponents"

export const revalidate = 900
export const dynamic = "force-static"
export const fetchCache = "default-no-store"

export async function generateMetadata(): Promise<Metadata> {
    const manifest = await prefetchManifest()
    const activityId = getActivePantheonIds(manifest)[0]
    const activity = activityId != null ? manifest.activityDefinitions[activityId] : undefined
    const version = manifest.versionDefinitions[PANTHEON_COMMUNITY_RACE_VERSION_ID]

    if (!activity || version?.associatedActivityId == null) {
        notFound()
    }

    const title = `${activity.name}: ${version.name} Community Race Leaderboard`
    const description = `View community race placements for ${version.name} in ${activity.name}`

    return {
        title,
        description,
        keywords: [
            activity.name,
            version.name,
            "community race",
            "pantheon",
            ...baseMetadata.keywords
        ],
        openGraph: {
            ...baseMetadata.openGraph,
            title,
            description
        }
    }
}

export default async function Page({ searchParams }: { searchParams: Record<string, string> }) {
    const manifest = await prefetchManifest()
    const activityId = getActivePantheonIds(manifest)[0]
    const activity = activityId != null ? manifest.activityDefinitions[activityId] : undefined
    const version = manifest.versionDefinitions[PANTHEON_COMMUNITY_RACE_VERSION_ID]

    if (!activity || version?.associatedActivityId == null) {
        notFound()
    }

    return (
        <Leaderboard
            heading={
                <Splash
                    tertiaryTitle={activity.name}
                    title={version.name}
                    subtitle="Community Race Leaderboard">
                    <CloudflareActivitySplash
                        activityId={version.associatedActivityId}
                        versionId={version.id}
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
                queryKey: ["raidhub", "leaderboard", "pantheon-community-race"],
                entriesPerPage: 50,
                apiUrl: "/leaderboard/team/custom/pantheon-community-race",
                params: null
            }}
            entries={
                <LeaderboardSSR
                    page={searchParams.page ?? "1"}
                    entriesPerPage={50}
                    apiUrl="/leaderboard/team/custom/pantheon-community-race"
                    params={null}
                />
            }
        />
    )
}
