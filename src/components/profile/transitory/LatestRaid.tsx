"use client"

import { Clock } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { CloudflareActivitySplash } from "~/components/CloudflareImage"
import { usePageProps } from "~/components/PageWrapper"
import Checkmark from "~/components/icons/Checkmark"
import Xmark from "~/components/icons/Xmark"
import { useLocale } from "~/components/providers/LocaleManager"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { useActivityDisplayParts } from "~/hooks/useActivityDisplayParts"
import type { ProfileProps } from "~/lib/profile/types"
import { cn } from "~/lib/tw"
import { useRaidHubActivtiesFirstPage, useRaidHubInstance } from "~/services/raidhub/hooks"
import { Badge } from "~/shad/badge"
import { Card, CardContent } from "~/shad/card"
import { getBungieDisplayName } from "~/util/destiny/getBungieDisplayName"
import { formattedTimeSince, secondsToHMS } from "~/util/presentation/formatting"
import { Latest } from "./Latest"

export const LatestRaid = () => {
    const { destinyMembershipId } = usePageProps<ProfileProps>()
    const { locale } = useLocale()
    const { pantheonVersions } = useRaidHubManifest()
    const { data: rawRecentActivity } = useRaidHubActivtiesFirstPage(destinyMembershipId, {
        select: res =>
            res.activities.find(a => a.playerCount < 50) ?? res.activities.find(() => true),
        suspense: true
    })

    const { data: latestActivity } = useRaidHubInstance(rawRecentActivity?.instanceId ?? "", {
        enabled: !!rawRecentActivity,
        suspense: true
    })

    const { playersToDisplay, hiddenPlayers } = useMemo(() => {
        if (!latestActivity) return { playersToDisplay: null, hiddenPlayers: 0 }
        if (latestActivity.playerCount <= 12) {
            return { playersToDisplay: latestActivity.players, hiddenPlayers: 0 }
        } else {
            return {
                playersToDisplay: latestActivity.players.slice(0, 6),
                hiddenPlayers: latestActivity.playerCount - 6
            }
        }
    }, [latestActivity])

    const display = useActivityDisplayParts(
        latestActivity ?? {
            activityId: 0,
            versionId: 0,
            playerCount: 0,
            fresh: null,
            flawless: null,
            isContest: false,
            completed: false
        },
        {
            includeFresh: false,
            pantheonTitleStyle: "boss"
        }
    )

    if (!latestActivity) {
        return null
    }

    const isPantheon = pantheonVersions.includes(latestActivity.versionId)
    const activityName = latestActivity.metadata.activityName
    const profilePlayer = latestActivity.players.find(
        p => p.playerInfo.membershipId === destinyMembershipId
    )
    const profileCompleted = profilePlayer?.completed ?? false

    return (
        <Latest $playerCount={latestActivity.playerCount ?? 6}>
            <Link href={`/pgcr/${latestActivity.instanceId}`} className="block h-full text-inherit">
                <Card className="border-border/60 bg-card/65 hover:border-border/80 h-full flex-col gap-0 overflow-hidden rounded-lg py-0 shadow-sm transition-colors">
                    <div className="relative h-24 shrink-0 overflow-hidden sm:h-28">
                        <CloudflareActivitySplash
                            activityId={latestActivity.activityId}
                            versionId={latestActivity.versionId}
                            fill
                            priority
                            alt="raid background image"
                            className="object-cover object-[center_30%] brightness-[0.8]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15 backdrop-blur-[2px]" />

                        <div className="absolute top-2.5 right-3 left-3 z-10 flex items-start justify-between gap-2">
                            <span className="text-sm font-medium tracking-wide text-white/50 uppercase tabular-nums">
                                {formattedTimeSince(new Date(latestActivity.dateCompleted), locale)}
                            </span>
                            <div
                                className={cn(
                                    "shrink-0 rounded-full p-0.5 backdrop-blur-sm",
                                    profileCompleted
                                        ? "bg-green-500/35 text-green-400"
                                        : "bg-red-500/35 text-red-400"
                                )}
                                aria-label={
                                    profileCompleted ? "Activity cleared" : "Activity not cleared"
                                }>
                                {profileCompleted ? <Checkmark sx={18} /> : <Xmark sx={18} />}
                            </div>
                        </div>

                        <div className="absolute right-3 bottom-2.5 left-3 z-10 min-w-0">
                            {isPantheon && (
                                <span className="mb-0.5 block truncate text-sm tracking-wide text-white/50">
                                    {activityName}
                                </span>
                            )}
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <h3 className="truncate text-lg font-bold text-white/95 drop-shadow-md sm:text-xl">
                                    {display?.title ?? activityName}
                                </h3>
                                {display?.versionLabel && (
                                    <Badge
                                        variant="outline"
                                        className="h-7 shrink-0 border-white/25 bg-black/40 px-2 py-0 text-sm font-medium text-white/90 backdrop-blur-sm sm:text-base">
                                        {display.versionLabel}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <CardContent className="px-3 py-2.5">
                        <div className="text-muted-foreground flex items-center gap-1.5 text-base sm:text-lg">
                            <Clock className="size-4 shrink-0" aria-hidden />
                            <span className="tabular-nums">
                                {secondsToHMS(latestActivity.duration, false)}
                            </span>
                        </div>

                        {playersToDisplay && playersToDisplay.length > 0 && (
                            <div className="mt-2 flex min-w-0 flex-wrap gap-1">
                                {playersToDisplay.map(player => (
                                    <span
                                        key={player.playerInfo.membershipId}
                                        className={cn(
                                            "border-border/50 bg-muted/20 inline-flex max-w-full min-w-0 items-center gap-1 rounded-sm border py-0.5 pr-1.5 pl-1 text-base",
                                            !player.completed && "opacity-70"
                                        )}>
                                        <span
                                            className={cn(
                                                "flex size-4 shrink-0 items-center justify-center",
                                                player.completed ? "text-green-400" : "text-red-400"
                                            )}
                                            aria-hidden>
                                            {player.completed ? (
                                                <Checkmark sx={14} />
                                            ) : (
                                                <Xmark sx={14} />
                                            )}
                                        </span>
                                        <span className="text-muted-foreground max-w-[9rem] min-w-0 truncate font-normal sm:max-w-[11rem]">
                                            {getBungieDisplayName(player.playerInfo)}
                                        </span>
                                    </span>
                                ))}
                                {!!hiddenPlayers && (
                                    <span className="text-muted-foreground self-center text-base tabular-nums">
                                        +{hiddenPlayers}
                                    </span>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Link>
        </Latest>
    )
}
