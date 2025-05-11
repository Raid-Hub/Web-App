import { type Collection } from "@discordjs/collection"
import Link from "next/link"
import { memo, useMemo } from "react"
import { useLocale } from "~/app/layout/wrappers/LocaleManager"
import { Card } from "~/components/Card"
import { CloudflareImage } from "~/components/CloudflareImage"
import Checkmark from "~/components/icons/Checkmark"
import Xmark from "~/components/icons/Xmark"
import { Flex } from "~/components/layout/Flex"
import { Grid } from "~/components/layout/Grid"
import { H4 } from "~/components/typography/H4"
import { getRaidSplash } from "~/data/activity-images"
import { useActivitiesByPartition } from "~/hooks/useActivitiesByPartition"
import { useAttributedRaidName } from "~/hooks/useAttributedRaidName"
import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { secondsToHMS, toCustomDateString } from "~/util/presentation/formatting"

export const ActivityHistoryList = memo(
    (props: { sections: number; allActivities: Collection<string, RaidHubInstanceForPlayer> }) => {
        const partitioned = useActivitiesByPartition(props.allActivities, 14400)
        const sections = useMemo(
            () => Array.from(partitioned.entries()).slice(0, props.sections),
            [partitioned, props.sections]
        )
        const { locale } = useLocale()

        return (
            <Grid $fullWidth $minCardWidth={500}>
                {sections.map(([key, partition]) => (
                    <Card key={key} style={{ padding: "0.5rem" }}>
                        <H4 style={{ marginTop: 10, marginLeft: 8 }}>
                            {toCustomDateString(new Date(key), locale)}
                        </H4>
                        <Grid $gap={0.85} $minCardWidth={450}>
                            {partition.map(a => (
                                <Activity key={a.instanceId} {...a} />
                            ))}
                        </Grid>
                    </Card>
                ))}
            </Grid>
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
        <Link href={`/pgcr/${activity.instanceId}`} style={{ color: "unset" }} rel="nofollow">
            <Flex $direction="row" $padding={0.3} $align="flex-start" $fullWidth $wrap>
                <div style={{ minWidth: "15%" }}>{date.toLocaleTimeString(locale)}</div>
                <CloudflareImage
                    alt=""
                    width={80}
                    height={45}
                    cloudflareId={getRaidSplash(activity.activityId) ?? "pantheonSplash"}
                />
                <div>{raidName}</div>
                <div>
                    <i>{secondsToHMS(activity.duration, false)}</i>
                </div>
                {activity.player.completed ? <Checkmark sx={20} /> : <Xmark sx={20} />}
            </Flex>
        </Link>
    )
}
