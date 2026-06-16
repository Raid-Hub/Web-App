"use client"

import { CheckCircle, Clock, MapPin, TriangleAlert, Users, XCircle } from "lucide-react"
import { usePGCRContext } from "~/hooks/pgcr/ClientStateManager"
import { getPgcrDisplayTitle } from "~/lib/pgcr/formatting"
import { formatTimeRangeTitle } from "~/lib/pgcr/time-range-title"
import { cn } from "~/lib/tw"
import { Badge } from "~/shad/badge"
import { CardHeader } from "~/shad/card"
import { secondsToHMS } from "~/util/presentation/formatting"
import { PGCRDate } from "./pgcr-date"
import { PGCRFeats } from "./pgcr-feats"
import { PGCRHeaderBackground } from "./pgcr-header-bg"
import { PGCRMenu } from "./pgcr-menu"
import { PGCRTags } from "./pgcr-tags"

export const PGCRHeader = () => {
    const { data } = usePGCRContext()
    const startDate = new Date(data.dateStarted)
    const endDate = new Date(data.dateCompleted)
    const completedCount = data.players.reduce((acc, player) => +player.completed + acc, 0)

    return (
        <PGCRHeaderBackground activityId={data.activityId} versionId={data.versionId}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 backdrop-blur-[2px]" />
            <CardHeader className="relative z-10 flex flex-col gap-2 p-2 md:p-6">
                <div className="inline-flex gap-4">
                    <PGCRDate />
                    {data.isBlacklisted && (
                        <div
                            title="This instance is blacklisted from appearing in leaderboards or tags on the participant's profiles"
                            className="flex-1 rounded-full bg-amber-600/20">
                            <TriangleAlert className="size-8 p-1.5 text-amber-400" />
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-white md:text-4xl">
                        {getPgcrDisplayTitle(data.metadata)}
                    </h1>

                    <div
                        title={data.completed ? "Activity Cleared" : "Activity Not Cleared"}
                        className={cn(
                            "rounded-full p-1",
                            data.completed
                                ? "bg-green-500/30 text-green-400"
                                : "bg-red-500/30 text-red-400"
                        )}>
                        {data.completed ? (
                            <CheckCircle className="h-7 w-7 p-1" />
                        ) : (
                            <XCircle className="h-7 w-7 p-1" />
                        )}
                    </div>

                    {!data.fresh && (
                        <div
                            title={
                                data.fresh === null
                                    ? "This activity may or may not be a checkpoint"
                                    : "This activity was started from a checkpoint"
                            }
                            className={cn(
                                "rounded-full p-1",
                                data.fresh === null
                                    ? "bg-purple-500/30 text-purple-400"
                                    : "bg-pink-500/30 text-pink-400"
                            )}>
                            <MapPin className="h-7 w-7 p-1" />
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {data.metadata.isRaid && (
                        <Badge
                            variant="secondary"
                            className="bg-primary/90 text-primary-foreground text-sm">
                            {data.isContest ? "Contest" : data.metadata.versionName}
                        </Badge>
                    )}
                    {data.difficultyTier === "adventure" && (
                        <Badge
                            variant="secondary"
                            className="bg-amber-600/90 text-sm text-amber-50">
                            Adventure
                        </Badge>
                    )}

                    <PGCRTags />
                    <PGCRFeats />
                </div>
                <div className="mt-4 flex items-center justify-center gap-4">
                    <div
                        title={formatTimeRangeTitle(startDate, endDate)}
                        className="flex items-center gap-2 text-zinc-300">
                        <Clock className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="text-xs md:text-sm">
                            {secondsToHMS(data.duration, false)}
                        </span>
                    </div>
                    {(data.playerCount > 3 || !data.completed) && (
                        <Badge
                            variant="outline"
                            title={`${completedCount} of ${data.playerCount} players completed the activity`}
                            className="bg-background/70 flex items-center gap-1 border-zinc-700 whitespace-nowrap">
                            <Users className="h-3 w-3" />
                            <span>{data.playerCount} Players</span>
                        </Badge>
                    )}
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-2">
                    <PGCRMenu />
                </div>
            </CardHeader>
        </PGCRHeaderBackground>
    )
}
