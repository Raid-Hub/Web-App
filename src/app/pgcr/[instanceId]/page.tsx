import type { Metadata } from "next"

import { PageWrapper } from "~/components/layout/PageWrapper"
import { baseMetadata } from "~/lib/metadata"
import { assertValidPath, getMetaData, prefetchActivity } from "~/lib/pgcr/server"
import { type PGCRPageProps } from "~/lib/pgcr/types"
import PGCR from "../components/pgcr-view"

export const revalidate = 0

export default async function Page({ params }: PGCRPageProps) {
    assertValidPath(params.instanceId)
    const activity = await prefetchActivity(params.instanceId)
    return (
        <PageWrapper>
            <PGCR data={activity} />
        </PageWrapper>
    )
}

export async function generateMetadata({ params }: PGCRPageProps): Promise<Metadata> {
    assertValidPath(params.instanceId)
    const activity = await prefetchActivity(params.instanceId)

    if (!activity) {
        return {
            robots: {
                follow: true,
                index: false
            }
        }
    }

    const { idTitle, ogTitle, description } = getMetaData(activity)

    const inheritedOpengraph = structuredClone(baseMetadata.openGraph)
    // Remove images from inherited metadata, otherwise it overrides the image generated
    // by the dynamic image generator
    delete inheritedOpengraph.images

    return {
        title: idTitle,
        description: description,
        keywords: [
            ...baseMetadata.keywords,
            "pgcr",
            "activity",
            activity.completed ? "clear" : "attempt",
            activity.leaderboardRank ? `#${activity.leaderboardRank}` : null,
            activity.metadata.activityName,
            activity.metadata.versionName,
            ...activity.players
                .slice(0, 6)
                .map(p => p.playerInfo.bungieGlobalDisplayName ?? p.playerInfo.displayName),
            "dot",
            "placement"
        ].filter(Boolean) as string[],
        openGraph: {
            ...inheritedOpengraph,
            title: ogTitle,
            description: description
        },
        twitter: {
            ...baseMetadata.twitter,
            card: "summary_large_image"
        },
        robots: {
            follow: true,
            // Only index lowmans, flawlesses, and placements
            index:
                !!activity.leaderboardRank ||
                !!activity.flawless ||
                (activity.completed && activity.playerCount <= 3)
        }
    }
}
