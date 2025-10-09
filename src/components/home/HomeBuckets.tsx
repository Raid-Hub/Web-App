"use client"

import Link from "next/link"
import { Fragment, useState } from "react"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { SpeedrunVariables } from "~/lib/speedrun/speedrun-com-mappings"
import { cn } from "~/lib/tw"
import { Card, CardContent, CardHeader, CardTitle } from "~/shad/card"
import { CloudflareImage, type CloudflareImageId } from "../CloudflareImage"

const BucketData: { title: string; splash: CloudflareImageId; Layout: () => JSX.Element }[] = [
    {
        title: "World First Leaderboards",
        splash: "worldFirstSplash",
        Layout: WorldFirstLinks
    },
    {
        title: "Clears Leaderboards",
        splash: "gardenOfSalvationSplash",
        Layout: ClearsLinks
    },
    {
        title: "Sherpa Leaderboards",
        splash: "raidhubCitySplash",
        Layout: SherpaLinks
    },
    {
        title: "Speedrun Leaderboards",
        splash: "speedrunPanelSplash",
        Layout: SpeedrunLinks
    },
    {
        title: "Misc Race Leaderboards",
        splash: "scourgeOfThePastSplash",
        Layout: VersionFirstLinks
    },
    {
        title: "Pantheon",
        splash: "genericRaidSplash",
        Layout: PantheonLinks
    }
]

export const Buckets = () => {
    return (
        <div className="4xl:grid-cols-4 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
            {BucketData.map(bucket => (
                <Bucket key={bucket.title} {...bucket} />
            ))}
        </div>
    )
}

function Bucket({ title, splash, Layout }: (typeof BucketData)[number]) {
    // State for mobile expand/collapse
    const [expanded, setExpanded] = useState(false)

    const handleToggle = () => {
        setExpanded(e => !e)
    }

    return (
        <Card key={title} className="gap-0">
            <CardHeader
                className="relative aspect-[5/1] cursor-pointer md:cursor-default"
                onClick={handleToggle}>
                <CloudflareImage
                    priority
                    fill
                    cloudflareId={splash}
                    alt=""
                    className="object-cover object-[50%_35%] brightness-75"
                />
                <CardTitle className="z-1 text-center text-lg font-extrabold whitespace-nowrap uppercase text-shadow-lg text-shadow-zinc-800 md:text-2xl lg:absolute lg:bottom-4 lg:left-4">
                    {title}
                </CardTitle>
            </CardHeader>

            <CardContent
                className={cn(
                    "overflow-hidden transition-all duration-200 md:pt-2",
                    expanded
                        ? "max-md:max-h-[1000px] max-md:opacity-100"
                        : "max-md:h-0 max-md:max-h-0 max-md:p-0 max-md:opacity-0"
                )}>
                <Layout />
            </CardContent>
        </Card>
    )
}

function WorldFirstLinks() {
    const { listedRaidIds, getActivityDefinition } = useRaidHubManifest()

    return (
        <ul className="space-y-1">
            {listedRaidIds
                .toSorted((a, b) => b - a)
                .map(raidId => {
                    const raidDef = getActivityDefinition(raidId)
                    if (!raidDef) return null

                    return (
                        <li key={raidId}>
                            <Link
                                href={`/leaderboards/team/${raidDef.path}/worldfirst`}
                                className="text-raidhub text-lg hover:underline">
                                {raidDef.name}
                            </Link>
                        </li>
                    )
                })}
        </ul>
    )
}

function SpeedrunLinks() {
    const { listedRaidIds, getActivityDefinition } = useRaidHubManifest()

    return (
        <ul className="space-y-1">
            {listedRaidIds
                .toSorted((a, b) => b - a)
                .map(raidId => {
                    const raidDef = getActivityDefinition(raidId)
                    if (!raidDef) return null

                    const srcVar = SpeedrunVariables[raidDef.path]?.variable

                    if (!srcVar)
                        return (
                            <li key={raidId}>
                                <h3 className="mx-4 inline font-bold">{raidDef.name}</h3>
                                <Link
                                    href={`/leaderboards/team/${raidDef.path}/speedrun/any`}
                                    target="_blank"
                                    className="text-raidhub text-lg hover:underline">
                                    Any %
                                </Link>
                            </li>
                        )

                    return (
                        <li key={raidId}>
                            <h3 className="mx-4 inline font-bold">{raidDef.name}</h3>
                            {Object.entries(srcVar.values).map(([type, data], idx, arr) => (
                                <Fragment key={data.id}>
                                    <Link
                                        href={`/leaderboards/team/${raidDef.path}/speedrun/${type}`}
                                        className="text-raidhub text-lg hover:underline">
                                        {data.displayName}
                                    </Link>
                                    {idx < arr.length - 1 && (
                                        <span className="text-secondary"> • </span>
                                    )}
                                </Fragment>
                            ))}
                        </li>
                    )
                })}
        </ul>
    )
}

function ClearsLinks() {
    const { listedRaidIds, getActivityDefinition } = useRaidHubManifest()

    return (
        <ul className="space-y-1">
            {listedRaidIds
                .toSorted((a, b) => b - a)
                .map(raidId => {
                    const raidDef = getActivityDefinition(raidId)
                    if (!raidDef) return null

                    return (
                        <div key={raidId}>
                            <h3 className="mx-4 inline font-bold">{raidDef.name}</h3>
                            <Link
                                href={`/leaderboards/individual/${raidDef.path}/freshClears`}
                                className="text-raidhub text-lg hover:underline">
                                Full
                            </Link>
                            <span className="text-secondary"> • </span>
                            <Link
                                href={`/leaderboards/individual/${raidDef.path}/clears`}
                                className="text-raidhub text-lg hover:underline">
                                Any
                            </Link>
                        </div>
                    )
                })}
        </ul>
    )
}

function SherpaLinks() {
    const { listedRaidIds, getActivityDefinition } = useRaidHubManifest()

    return (
        <ul className="space-y-1">
            {listedRaidIds
                .toSorted((a, b) => b - a)
                .map(raidId => {
                    const raidDef = getActivityDefinition(raidId)
                    if (!raidDef) return null

                    return (
                        <li key={raidId}>
                            <Link
                                href={`/leaderboards/individual/${raidDef.path}/sherpas`}
                                className="text-raidhub text-lg hover:underline">
                                {raidDef.name}
                            </Link>
                        </li>
                    )
                })}
        </ul>
    )
}

function VersionFirstLinks() {
    const { listedRaidIds, resprisedRaidIds, getVersionsForActivity, getActivityDefinition } =
        useRaidHubManifest()

    return (
        <ul className="space-y-1">
            {listedRaidIds
                .toSorted((a, b) => b - a)
                .map(raidId => {
                    const raidDef = getActivityDefinition(raidId)
                    if (!raidDef) return null

                    const isReprised = resprisedRaidIds.includes(raidId)
                    const miscBoards = getVersionsForActivity(raidId).filter(
                        v =>
                            v.id !== 32 &&
                            v.id !== 2 &&
                            ((v.id == 1 ? raidId >= 15 : !isReprised) ||
                                (isReprised && !v.isChallengeMode))
                    )

                    return (
                        <div key={raidId}>
                            <h3 className="mx-4 inline font-bold">{raidDef.name}</h3>
                            {miscBoards.map((version, idx, arr) => (
                                <Fragment key={version.id}>
                                    <Link
                                        href={`/leaderboards/team/${raidDef.path}/first/${version.path}`}
                                        className="text-raidhub text-lg hover:underline">
                                        {version.name.replace("Standard", "Normal Contest")}
                                    </Link>

                                    {idx < arr.length - 1 && (
                                        <span className="text-secondary"> • </span>
                                    )}
                                </Fragment>
                            ))}
                        </div>
                    )
                })}
        </ul>
    )
}

function PantheonLinks() {
    const { pantheonVersions, getVersionString, getUrlPathForVersion } = useRaidHubManifest()
    return (
        <div>
            <h3 className="mb-2 text-lg font-bold">First Completions</h3>
            <ul>
                {pantheonVersions.map(version => (
                    <li key={`first-${version}`}>
                        <Link
                            href={`/leaderboards/team/pantheon/first/${getUrlPathForVersion(version)}`}
                            className="text-raidhub text-lg hover:underline">
                            {getVersionString(version)}
                        </Link>
                    </li>
                ))}
            </ul>
            <h3 className="mt-4 mb-2 text-lg font-bold">Full Clears</h3>
            <ul>
                {pantheonVersions.map(version => (
                    <li key={`clears-${version}`}>
                        <Link
                            href={`/leaderboards/individual/pantheon/${getUrlPathForVersion(
                                version
                            )}/freshClears`}
                            className="text-raidhub text-lg hover:underline">
                            {getVersionString(version)}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
