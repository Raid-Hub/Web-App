"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { PANTHEON_COMMUNITY_RACE_VERSION_ID } from "~/lib/manifest/pantheon"
import { SpeedrunVariables } from "~/lib/speedrun/speedrun-com-mappings"
import { cn } from "~/lib/tw"
import type { RaidHubActivityDefinition } from "~/services/raidhub/types"
import { Card, CardContent, CardHeader, CardTitle } from "~/shad/card"
import { CloudflareActivitySplash } from "../CloudflareImage"

type LinkItem = { href: string; label: string; accent?: "gold" }
type LinkSection = { title: string; links: LinkItem[] }

const cardClass =
    "border-border/50 bg-card/40 flex h-full flex-col gap-0 overflow-hidden rounded-lg py-0 shadow-sm"
const headerClass = "relative h-28 cursor-pointer p-0 md:cursor-default"
const contentClass =
    "divide-border/40 bg-background/20 divide-y overflow-hidden p-0 transition-all duration-200 md:block"
const rowClass =
    "hover:bg-raidhub/5 group flex items-center justify-between gap-3 px-4 py-2 transition-colors"

export const Buckets = () => {
    const {
        listedRaidIds,
        pantheonIds,
        activePantheonIds,
        activePantheonVersions,
        pantheonSunsetVersions,
        getActivityDefinition
    } = useRaidHubManifest()

    const raids = useMemo(
        () =>
            listedRaidIds
                .filter(id => !pantheonIds.includes(id))
                .toSorted((a, b) => b - a)
                .map(id => getActivityDefinition(id))
                .filter((raid): raid is RaidHubActivityDefinition => raid != null),
        [listedRaidIds, pantheonIds, getActivityDefinition]
    )

    const epicDpIndex = raids.findIndex(raid => raid.path === "desertperpetualepic")
    const raidsBeforeEpic = epicDpIndex === -1 ? raids : raids.slice(0, epicDpIndex)
    const raidsFromEpic = epicDpIndex === -1 ? [] : raids.slice(epicDpIndex)

    const sunsetPantheonId = useMemo(
        () => pantheonIds.find(id => getActivityDefinition(id)?.isSunset) ?? null,
        [pantheonIds, getActivityDefinition]
    )

    return (
        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(min(100%,22rem),1fr))] items-stretch gap-3 sm:gap-4">
            {raidsBeforeEpic.map(raid => (
                <RaidCard key={raid.id} raid={raid} />
            ))}
            {activePantheonVersions.length > 0 && (
                <PantheonCard
                    activityId={activePantheonIds[0] ?? null}
                    versions={activePantheonVersions}
                    includeCommunityRace
                />
            )}
            {raidsFromEpic.map(raid => (
                <RaidCard key={raid.id} raid={raid} />
            ))}
            {pantheonSunsetVersions.length > 0 && (
                <PantheonCard activityId={sunsetPantheonId} versions={pantheonSunsetVersions} />
            )}
        </div>
    )
}

function formatReleaseDate(iso: string | null | undefined): string | null {
    if (!iso) return null

    return new Date(iso).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    })
}

function SplashHeader({
    title,
    activityId,
    releaseDate,
    expanded,
    onToggle
}: {
    title: string
    activityId?: number | null
    releaseDate?: string | null
    expanded: boolean
    onToggle: () => void
}) {
    const formattedReleaseDate = formatReleaseDate(releaseDate)

    return (
        <CardHeader className={headerClass} onClick={onToggle}>
            {activityId ? (
                <CloudflareActivitySplash
                    activityId={activityId}
                    alt=""
                    fill
                    className="object-cover object-[center_30%] brightness-[0.7]"
                />
            ) : (
                <div className="bg-muted h-full w-full" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20" />
            <div className="absolute right-10 bottom-3 left-4 z-1 flex min-w-0 flex-col gap-0.5">
                {formattedReleaseDate ? (
                    <span className="text-[10px] font-normal tracking-wide text-white/30 uppercase tabular-nums drop-shadow-md">
                        {formattedReleaseDate}
                    </span>
                ) : null}
                <CardTitle className="truncate text-lg font-bold text-white/95 drop-shadow-md">
                    {title}
                </CardTitle>
            </div>
            <ChevronRight
                className={cn(
                    "absolute right-4 bottom-3.5 z-1 size-4 text-white/70 transition-transform md:hidden",
                    expanded && "rotate-90"
                )}
            />
        </CardHeader>
    )
}

function LinkRow({ href, label, accent }: LinkItem) {
    const isGold = accent === "gold"

    return (
        <Link href={href} className={cn(rowClass, isGold && "hover:bg-raidhub/8")}>
            <span
                className={cn(
                    "min-w-0 text-sm transition-colors",
                    isGold
                        ? "text-raidhub/65 group-hover:text-raidhub"
                        : "text-muted-foreground group-hover:text-raidhub"
                )}>
                {label}
            </span>
            <ChevronRight
                className={cn(
                    "size-3.5 shrink-0 transition-colors",
                    isGold
                        ? "text-raidhub/45 group-hover:text-raidhub"
                        : "text-muted-foreground/50 group-hover:text-raidhub"
                )}
            />
        </Link>
    )
}

function SplitLinkSection({ title, links }: LinkSection) {
    return (
        <div className="border-border/40 flex border-b last:border-b-0">
            <div className="border-border/40 bg-muted/15 text-secondary flex w-[42%] shrink-0 items-center border-r px-4 py-2 text-sm leading-snug">
                {title}
            </div>
            <div className="divide-border/40 bg-background/10 flex min-w-0 flex-1 flex-col divide-y">
                {links.map(link => (
                    <LinkRow key={link.href} {...link} />
                ))}
            </div>
        </div>
    )
}

function RaidCard({ raid }: { raid: RaidHubActivityDefinition }) {
    const { resprisedRaidIds, getVersionsForActivity } = useRaidHubManifest()
    const [expanded, setExpanded] = useState(false)
    const sections = useMemo(
        () => buildRaidSections(raid, resprisedRaidIds, getVersionsForActivity),
        [raid, resprisedRaidIds, getVersionsForActivity]
    )

    return (
        <Card className={cardClass}>
            <SplashHeader
                title={raid.name}
                activityId={raid.id}
                releaseDate={raid.releaseDate}
                expanded={expanded}
                onToggle={() => setExpanded(e => !e)}
            />
            <CardContent
                className={cn(
                    contentClass,
                    "flex flex-1 flex-col divide-y-0",
                    expanded
                        ? "max-md:max-h-[2000px] max-md:opacity-100"
                        : "max-md:h-0 max-md:max-h-0 max-md:opacity-0"
                )}>
                {sections.map(section => (
                    <SplitLinkSection key={section.title} {...section} />
                ))}
            </CardContent>
        </Card>
    )
}

const PANTHEON_COMMUNITY_RACE_LINK: LinkItem = {
    href: "/leaderboards/team/custom/pantheon-community-race",
    label: "Community Race",
    accent: "gold"
}

function PantheonCard({
    activityId,
    versions,
    includeCommunityRace = false
}: {
    activityId: number | null
    versions: readonly number[]
    includeCommunityRace?: boolean
}) {
    const { getActivityDefinition, getVersionString, getUrlPathForVersion } = useRaidHubManifest()
    const [expanded, setExpanded] = useState(false)
    const title =
        (activityId != null ? getActivityDefinition(activityId)?.name : null) ?? "The Pantheon"
    const releaseDate = activityId != null ? getActivityDefinition(activityId)?.releaseDate : null

    const versionGroups = useMemo(
        () =>
            versions
                .toSorted((a, b) => b - a)
                .map(version => {
                    const path = getUrlPathForVersion(version)
                    if (!path) return null

                    return {
                        title: getVersionString(version),
                        links: [
                            ...(includeCommunityRace &&
                            version === PANTHEON_COMMUNITY_RACE_VERSION_ID
                                ? [PANTHEON_COMMUNITY_RACE_LINK]
                                : []),
                            {
                                href: `/leaderboards/team/pantheon/first/${path}`,
                                label: "First Completions"
                            },
                            {
                                href: `/leaderboards/individual/pantheon/${path}/freshClears`,
                                label: "Full Clears"
                            }
                        ]
                    }
                })
                .filter((group): group is LinkSection => group != null),
        [versions, getVersionString, getUrlPathForVersion, includeCommunityRace]
    )

    return (
        <Card className={cardClass}>
            <SplashHeader
                title={title}
                activityId={activityId}
                releaseDate={releaseDate}
                expanded={expanded}
                onToggle={() => setExpanded(e => !e)}
            />
            <CardContent
                className={cn(
                    contentClass,
                    "flex flex-1 flex-col divide-y-0",
                    expanded
                        ? "max-md:max-h-[2000px] max-md:opacity-100"
                        : "max-md:h-0 max-md:max-h-0 max-md:opacity-0"
                )}>
                {versionGroups.map(group => (
                    <SplitLinkSection key={group.title} {...group} />
                ))}
            </CardContent>
        </Card>
    )
}

function buildRaidSections(
    raid: RaidHubActivityDefinition,
    resprisedRaidIds: readonly number[],
    getVersionsForActivity: (
        activityId: number
    ) => readonly { id: number; path: string; name: string; isChallengeMode: boolean }[]
): LinkSection[] {
    const path = raid.path
    const team: LinkItem[] = [
        { href: `/leaderboards/team/${path}/worldfirst`, label: "World First", accent: "gold" }
    ]

    const speedrun: LinkItem[] = []
    const srcVar = SpeedrunVariables[path]?.variable
    if (srcVar) {
        for (const [type, data] of Object.entries(srcVar.values)) {
            speedrun.push({
                href: `/leaderboards/team/${path}/speedrun/${type}`,
                label: data.displayName
            })
        }
    } else {
        speedrun.push({
            href: `/leaderboards/team/${path}/speedrun/any`,
            label: "Any %"
        })
    }

    const isReprised = resprisedRaidIds.includes(raid.id)
    const miscBoards = getVersionsForActivity(raid.id).filter(
        v =>
            v.id !== 32 &&
            v.id !== 2 &&
            ((v.id == 1 ? raid.id >= 15 : !isReprised) || (isReprised && !v.isChallengeMode))
    )

    for (const version of miscBoards) {
        team.push({
            href: `/leaderboards/team/${path}/first/${version.path}`,
            label: `First ${version.name.replace("Standard", "Normal Contest")}`
        })
    }

    const individual: LinkItem[] = [
        { href: `/leaderboards/individual/${path}/freshClears`, label: "Full Clears" },
        { href: `/leaderboards/individual/${path}/clears`, label: "Any Clears" },
        { href: `/leaderboards/individual/${path}/sherpas`, label: "Sherpas" }
    ]

    return [
        { title: "Team", links: team },
        { title: "Speedrun", links: speedrun },
        { title: "Individual", links: individual }
    ]
}
