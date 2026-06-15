"use client"

import {
    getPlaySessionEndAt,
    getPlaySessionSpanSeconds,
    getPlaySessionStartAt,
    type PlaySession
} from "~/lib/activity/sessions"

import { Separator } from "~/shad/separator"

import { secondsToHMS } from "~/util/presentation/formatting"

import { ActivityClusterBlock } from "./ActivityClusterBlock"

export const PlaySessionBlock = ({
    session,

    profileMembershipIds
}: {
    session: PlaySession

    profileMembershipIds: readonly string[]
}) => {
    const spanSeconds = getPlaySessionSpanSeconds(session)

    const timeFormatter = new Intl.DateTimeFormat(undefined, {
        hour: "numeric",

        minute: "2-digit"
    })

    return (
        <article className="border-border/50 bg-card/25 ring-border/30 overflow-hidden rounded-xl border shadow-sm ring-1 backdrop-blur-lg">
            <header className="border-border/40 bg-muted/20 border-b px-4 py-2.5 backdrop-blur-md">
                <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs tabular-nums sm:text-sm">
                    <span>
                        {timeFormatter.format(getPlaySessionStartAt(session))} –{" "}
                        {timeFormatter.format(getPlaySessionEndAt(session))}
                    </span>

                    {spanSeconds > 0 && (
                        <>
                            <Separator orientation="vertical" className="bg-border/60 h-3" />

                            <span className="text-foreground/80">
                                {secondsToHMS(spanSeconds, false)}
                            </span>
                        </>
                    )}
                </div>
            </header>

            <div className="flex flex-col gap-2.5 p-2.5">
                {session.clusters.map(cluster => (
                    <ActivityClusterBlock
                        key={cluster.id}
                        cluster={cluster}
                        profileMembershipIds={profileMembershipIds}
                    />
                ))}
            </div>
        </article>
    )
}
