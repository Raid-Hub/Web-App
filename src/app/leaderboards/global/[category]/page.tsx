import { type Metadata } from "next"
import { metadata as rootMetadata } from "~/app/layout"
import { prefetchManifest } from "~/services/raidhub/prefetchRaidHubManifest"
import type { PageStaticParams } from "~/types/generic"
import { Leaderboard } from "../../Leaderboard"
import { GlobalEntriesBanner } from "./GlobalEntriesBanner"
import { GlobalSSREntries } from "./GlobalSSREntries"
import { ENTRIES_PER_PAGE, createQueryKey } from "./constants"

export async function generateStaticParams() {
    const manifest = await prefetchManifest()

    return manifest.leaderboards.global.map(board => ({
        category: board.category
    }))
}

type StaticParams = PageStaticParams<typeof generateStaticParams> & {
    searchParams: {
        page?: string
    }
}

export async function generateMetadata({ params }: StaticParams): Promise<Metadata> {
    const manifest = await prefetchManifest()

    const displayName = manifest.leaderboards.global.find(
        board => board.category === params.category
    )!.displayName

    const title = displayName + " Leaderboards"
    return {
        title: title,
        openGraph: {
            ...rootMetadata.openGraph,
            title: title
        }
    }
}

export default async function Page({ params, searchParams }: StaticParams) {
    const globalLeaderboards = await prefetchManifest().then(
        manifest => manifest.leaderboards.global
    )

    const { displayName, format } = globalLeaderboards.find(l => l.category === params.category)!

    return (
        <Leaderboard
            pageProps={{ format, type: "player", count: ENTRIES_PER_PAGE }}
            type="global"
            category={params.category}
            hasPages
            refreshQueryKey={createQueryKey({ page: 1, category: params.category })}
            heading={<GlobalEntriesBanner category={params.category} title={displayName} />}
            entries={
                <GlobalSSREntries category={params.category} page={searchParams.page ?? "1"} />
            }
        />
    )
}