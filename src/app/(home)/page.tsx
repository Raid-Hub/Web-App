import { HomeQuickLinks } from "~/components/home/HomeQuickLinks"
import { PageWrapper } from "~/components/layout/PageWrapper"
import { baseMetadata } from "~/lib/metadata"
import { prefetchManifest } from "~/services/raidhub/prefetchRaidHubManifest"
import { Cards } from "./HomeCards"
import { HomeLogo } from "./HomeLogo"
import { HomeSearchBar } from "./search/HomeSearchBar"

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
        <PageWrapper>
            <HomeLogo />
            <HomeSearchBar />
            <HomeQuickLinks />
            <Cards />
        </PageWrapper>
    )
}
