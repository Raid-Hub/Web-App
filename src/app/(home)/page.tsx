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
        <PageWrapper className="mx-auto flex max-w-[120rem] flex-col gap-6 py-2">
            <div className="flex flex-col items-center gap-4">
                <HomeLogo />
                <HomeSearchButton />
            </div>
            <HomeQuickLinks />
            <Buckets />
        </PageWrapper>
    )
}
