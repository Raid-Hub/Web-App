import type { Metadata } from "next"
import { metadata as rootMetaData } from "~/app/layout"

import { PageWrapper } from "~/components/layout/PageWrapper"
import { assertValidPath, getMetaData, prefetchActivity } from "~/lib/pgcr/server"
import { type PGCRPageProps } from "~/lib/pgcr/types"
import PGCR from "../components/PGCR"

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

    const inheritedOpengraph = structuredClone(rootMetaData.openGraph)
    // Remove images from inherited metadata, otherwise it overrides the image generated
    // by the dynamic image generator
    delete inheritedOpengraph.images

    return {
        title: idTitle,
        description: description,
        keywords: [
            ...rootMetaData.keywords,
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
            ...rootMetaData.twitter,
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
