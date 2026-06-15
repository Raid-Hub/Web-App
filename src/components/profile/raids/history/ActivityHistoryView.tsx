"use client"

import { type Collection } from "@discordjs/collection"
import { memo } from "react"
import { useLocale } from "~/components/providers/LocaleManager"
import { useActivitySessions } from "~/hooks/useActivitySessions"
import { parseLocalDateKey } from "~/lib/activity/sessions"
import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"
import { Button } from "~/shad/button"
import { formattedTimeSince, toCustomDateString } from "~/util/presentation/formatting"
import { PlaySessionBlock } from "./PlaySessionBlock"

export const ActivityHistoryView = memo(
    ({
        activities,
        visibleSessionCount,
        onLoadMore,
        isLoading,
        profileMembershipIds
    }: {
        activities: Collection<string, RaidHubInstanceForPlayer>
        visibleSessionCount: number
        onLoadMore: () => void
        isLoading: boolean
        profileMembershipIds: readonly string[]
    }) => {
        const { dayGroups, hasMore } = useActivitySessions(activities, visibleSessionCount)
        const { locale } = useLocale()

        if (activities.size === 0 && !isLoading) {
            return (
                <div className="border-border/60 bg-card/40 text-muted-foreground rounded-lg border px-4 py-10 text-center text-sm">
                    No activity history yet.
                </div>
            )
        }

        return (
            <div className="flex w-full flex-col gap-4">
                {dayGroups.map(([dayKey, sessions]) => (
                    <section key={dayKey} className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
                            <h3 className="text-base font-semibold">
                                {toCustomDateString(parseLocalDateKey(dayKey), locale)}
                            </h3>
                            <span className="text-muted-foreground text-sm">
                                {formattedTimeSince(parseLocalDateKey(dayKey), locale)}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3">
                            {sessions.map(session => (
                                <PlaySessionBlock
                                    key={session.id}
                                    session={session}
                                    profileMembershipIds={profileMembershipIds}
                                />
                            ))}
                        </div>
                    </section>
                ))}

                {hasMore && (
                    <Button
                        variant="outline"
                        disabled={isLoading}
                        onClick={onLoadMore}
                        className="w-full sm:w-auto">
                        Load more
                    </Button>
                )}
            </div>
        )
    }
)

ActivityHistoryView.displayName = "ActivityHistoryView"
