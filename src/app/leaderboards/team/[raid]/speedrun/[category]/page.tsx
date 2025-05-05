import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { Leaderboard } from "~/app/leaderboards/Leaderboard"
import { SpeedrunVariables, type RTABoardCategory } from "~/data/speedrun-com-mappings"
import { baseMetadata } from "~/lib/metadata"
import { prefetchManifest } from "~/services/raidhub/prefetchRaidHubManifest"
import { getRaidDefinition } from "../../../../util"
import { SpeedrunComBanner } from "./SpeedrunComBanner"
import { SpeedrunComControls } from "./SpeedrunComControls"
import { SpeedrunEntries } from "./SpeedrunEntries"

export const dynamicParams = true
export const revalidate = 900
export const dynamic = "force-static"
export const fetchCache = "default-no-store"

type DynamicParams = {
    params: {
        raid: string
        category: RTABoardCategory | "all"
    }
    searchParams: Record<string, string>
}

export async function generateStaticParams() {
    const manifest = await prefetchManifest()

    return Object.values(manifest.activityDefinitions)
        .filter(d => d.isRaid)
        .map(def => {
            const data = SpeedrunVariables[def.path]
            if (!data?.variable) {
                return [
                    {
                        raid: def.path,
                        category: "all" as const
                    }
                ]
            } else {
                return Object.keys(data.variable.values).map(key => ({
                    raid: def.path,
                    category: key as RTABoardCategory
                }))
            }
        })
}

export async function generateMetadata({ params }: DynamicParams): Promise<Metadata> {
    const manifest = await prefetchManifest()
    const definition = getRaidDefinition(params.raid, manifest)
    const categoryId = SpeedrunVariables[definition.path]?.categoryId

    if (!categoryId) return notFound()

    const displayName =
        params.category !== "all"
            ? (SpeedrunVariables[definition.path]?.variable?.values[params.category]?.displayName ??
              null)
            : null

    const title = [definition.name, displayName, "Speedrun Leaderboards"].filter(Boolean).join(" ")
    const description = `View the fastest ${[displayName, definition.name]
        .filter(Boolean)
        .join(" ")} speedruns`

    return {
        title: title,
        description: description,
        keywords: [
            definition.name,
            displayName,
            "speedrun",
            "world record",
            "rankings",
            ...baseMetadata.keywords
        ].filter(Boolean) as string[],
        openGraph: {
            ...baseMetadata.openGraph,
            title: title,
            description: description
        }
    }
}

export default async function Page({ params }: DynamicParams) {
    const manifest = await prefetchManifest()

    const raid = getRaidDefinition(params.raid, manifest)
    const category = params.category === "all" ? undefined : params.category

    const categoryId = SpeedrunVariables[raid.path]?.categoryId
    if (!categoryId) return notFound()

    return (
        <Leaderboard
            pageProps={{
                entriesPerPage: 50,
                layout: "team",
                queryKey: ["speedrun.com", "leaderboard", params.raid, params.category]
            }}
            external
            hasPages={false}
            hasSearch={false}
            heading={
                <SpeedrunComBanner raidPath={raid.path} raidId={raid.id} category={category} />
            }
            extraControls={
                <SpeedrunComControls raidPath={raid.path} raidId={raid.id} category={category} />
            }
            entries={
                <SpeedrunEntries
                    raidPath={raid.path}
                    category={category}
                    queryKey={["speedrun.com", "leaderboard", params.raid, params.category]}
                />
            }
        />
    )
}
