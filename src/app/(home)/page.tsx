import { PageWrapper } from "~/components/PageWrapper"
import { Buckets } from "~/components/home/HomeBuckets"
import { HomeLogo } from "~/components/home/HomeLogo"
import { HomeQuickLinks } from "~/components/home/HomeQuickLinks"
import { HomeSearchButton } from "~/components/home/HomeSearchButton"
import { baseMetadata } from "~/lib/metadata"
import { prefetchManifest } from "~/services/raidhub/prefetchRaidHubManifest"

export const revalidate = 180 // static revalidation (5 minutes in seconds)

export async function generateMetadata() {
    const manifest = await prefetchManifest()

    return {
        keywords: [
            ...baseMetadata.keywords,
            ...Object.values(manifest.activityDefinitions)
                .map(def => def.name)
                .reverse()
        ].filter(Boolean)
    }
}
export default async function Page() {
    return (
        <PageWrapper className="space-y-6">
            <HomeLogo />
            <HomeSearchButton />
            <HomeQuickLinks />
            <Buckets />
        </PageWrapper>
    )
}
