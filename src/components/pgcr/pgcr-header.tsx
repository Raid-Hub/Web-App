import { CheckCircle, Clock, Flag, Users, XCircle } from "lucide-react"
import { R2RaidSplash, getRaidSplash } from "~/data/activity-images"
import { cn } from "~/lib/tw"
import { type RaidHubInstanceExtended } from "~/services/raidhub/types"
import { Badge } from "~/shad/badge"
import { CardHeader } from "~/shad/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shad/tooltip"
import { secondsToHMS } from "~/util/presentation/formatting"
import { PGCRDate, TimeRangeTooltip } from "./pgcr-date"
import { PGCRMenu } from "./pgcr-menu"
import { PGCRTags } from "./pgcr-tags"

interface PGCRHeaderProps {
    data: RaidHubInstanceExtended
}

export const PGCRHeader = ({ data }: PGCRHeaderProps) => {
    const backgroundImage = getRaidSplash(data.activityId)!
    const backgroundImageUrl = [
        "https://cdn.raidhub.io/content",
        R2RaidSplash[backgroundImage].path,
        R2RaidSplash[backgroundImage].variants.small
    ].join("/")

    return (
        <div
            className="relative min-h-40 overflow-hidden rounded-t-lg md:h-48"
            style={{
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 backdrop-blur-[2px]" />
            <CardHeader className="absolute inset-0 flex flex-col gap-2 p-2 md:p-6">
                <PGCRDate />
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-white md:text-4xl">
                        {data.metadata.isRaid
                            ? data.metadata.activityName
                            : `${data.metadata.activityName}: ${data.metadata.versionName}`}
                    </h1>

                    {/* Cleared status badge */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
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
                        </TooltipTrigger>
                        <TooltipContent>
                            {data.completed ? "Activity Cleared" : "Activity Not Cleared"}
                        </TooltipContent>
                    </Tooltip>

                    {/* Checkpoint flag */}
                    {!data.fresh && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className={cn(
                                        "rounded-full p-1",
                                        data.fresh === null
                                            ? "bg-amber-500/30 text-amber-400"
                                            : "bg-orange-500/30 text-orange-400"
                                    )}>
                                    <Flag className="h-7 w-7 p-1" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                {data.fresh === null
                                    ? "This activity may or may not be a checkpoint"
                                    : "This activity was started from a checkpoint"}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Difficulty badge */}
                    {data.metadata.isRaid && (
                        <Badge
                            variant="secondary"
                            className="bg-primary/90 text-primary-foreground text-sm">
                            {data.isContest ? "Contest" : data.metadata.versionName}
                        </Badge>
                    )}

                    {/* Tags */}
                    <PGCRTags />
                </div>
                <div className="mt-4 flex items-center justify-center gap-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 text-zinc-300">
                                <Clock className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-xs md:text-sm">
                                    {secondsToHMS(data.duration, false)}
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TimeRangeTooltip
                            startDate={new Date(data.dateStarted)}
                            endDate={new Date(data.dateCompleted)}
                        />
                    </Tooltip>
                    {(data.playerCount > 3 || !data.completed) && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge
                                    variant="outline"
                                    className="bg-background/70 flex items-center gap-1 border-zinc-700 whitespace-nowrap">
                                    <Users className="h-3 w-3" />
                                    <span>{data.playerCount} Players</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                {`${data.players.reduce(
                                    (acc, player) => +player.completed + acc,
                                    0
                                )} of ${data.playerCount} players completed the activity`}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-2">
                    <PGCRMenu />
                </div>
            </CardHeader>
        </div>
    )
}
