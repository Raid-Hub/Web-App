import Link from "next/link"
import Checkmark from "~/components/icons/Checkmark"
import Xmark from "~/components/icons/Xmark"
import { useActivityDisplayParts } from "~/hooks/useActivityDisplayParts"
import { cn } from "~/lib/tw"
import { Tag } from "~/models/tag"
import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { Badge } from "~/shad/badge"
import { secondsToHMS } from "~/util/presentation/formatting"

export const ActivityAttemptRow = ({
    activity,
    compact = false
}: {
    activity: RaidHubInstanceForPlayer
    compact?: boolean
}) => {
    const display = useActivityDisplayParts(activity, {
        includeFresh: false,
        excludeTitle: true
    })
    const completed = activity.player.completed
    const date = new Date(activity.dateCompleted)

    return (
        <Link
            href={`/pgcr/${activity.instanceId}`}
            rel="nofollow"
            className={cn(
                "hover:bg-muted/25 grid grid-cols-[4.25rem_minmax(0,1fr)_auto_auto] items-center gap-x-2 px-3 transition-colors hover:backdrop-blur-sm sm:grid-cols-[5rem_minmax(0,1fr)_auto_auto]",
                compact ? "py-2" : "py-2.5"
            )}>
            <time className="text-muted-foreground shrink-0 text-[11px] tabular-nums sm:text-xs">
                {date.toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit"
                })}
            </time>

            <div className="flex min-w-0 flex-wrap items-center gap-1">
                {display?.tags.length ? (
                    display.tags.map(tag => (
                        <Badge
                            key={tag}
                            variant="outline"
                            className={cn(
                                "border-border/50 bg-background/30 h-5 px-1.5 py-0 text-[10px] font-medium backdrop-blur-sm",
                                tag === Tag.CHECKPOINT &&
                                    "border-pink-500/30 bg-pink-500/10 text-pink-200"
                            )}>
                            {tag}
                        </Badge>
                    ))
                ) : (
                    <span className="text-muted-foreground text-xs">Standard</span>
                )}
            </div>

            <div
                className={cn(
                    "flex size-5 shrink-0 items-center justify-center",
                    completed ? "text-green-400" : "text-red-400"
                )}
                aria-hidden>
                {completed ? <Checkmark sx={16} /> : <Xmark sx={16} />}
            </div>

            <span className="text-muted-foreground w-14 shrink-0 text-right text-[11px] tabular-nums sm:text-xs">
                {secondsToHMS(activity.duration, false)}
            </span>
        </Link>
    )
}
