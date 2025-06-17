import { type Collection } from "@discordjs/collection"
import Link from "next/link"
import { memo, useMemo } from "react"
import Checkmark from "~/components/icons/Checkmark"
import Xmark from "~/components/icons/Xmark"
import { useLocale } from "~/components/providers/LocaleManager"
import { useActivitiesByPartition } from "~/hooks/useActivitiesByPartition"
import { useAttributedRaidName } from "~/hooks/useAttributedRaidName"
import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import {
    formattedTimeSince,
    secondsToHMS,
    toCustomDateString
} from "~/util/presentation/formatting"

export const ActivityHistoryList = memo(
    (props: { sections: number; allActivities: Collection<string, RaidHubInstanceForPlayer> }) => {
        const partitioned = useActivitiesByPartition(props.allActivities, 14400)
        const sections = useMemo(
            () => Array.from(partitioned.entries()).slice(0, props.sections),
            [partitioned, props.sections]
        )
        const { locale } = useLocale()

        return (
            <div className="grid w-full grid-cols-1 gap-4 max-sm:grid-cols-1">
                {sections.map(([key, partition]) => (
                    <div key={key} className="bg-card space-y-4 border-1 p-2">
                        <span className="inline-flex gap-2">
                            <h4 className="text-xl">{toCustomDateString(new Date(key), locale)}</h4>
                            <h5 className="text-secondary text-lg">
                                {formattedTimeSince(new Date(key), locale)}
                            </h5>
                        </span>
                        <div className="flex flex-col gap-2">
                            {partition.map(a => (
                                <Activity key={a.instanceId} {...a} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }
)

ActivityHistoryList.displayName = "ActivityHistoryList"

const Activity = (activity: RaidHubInstanceForPlayer) => {
    const { locale } = useLocale()
    const raidName = useAttributedRaidName(activity, {
        includeFresh: false,
        excludeRaidName: false
    })

    const date = new Date(activity.dateCompleted)
    return (
        <Link href={`/pgcr/${activity.instanceId}`} rel="nofollow">
            <div className="flex items-center justify-between gap-4 text-sm md:justify-start md:text-lg">
                <div className="flex-grow-0 basis-40">{date.toLocaleTimeString(locale)}</div>
                <div className="flex-grow-0 basis-90">{raidName}</div>
                <div className="inline-flex flex-grow-0 basis-50 gap-1">
                    {activity.player.completed ? <Checkmark sx={20} /> : <Xmark sx={20} />}
                    <i>{secondsToHMS(activity.duration, false)}</i>
                </div>
            </div>
        </Link>
    )
}
