"use client"

import { type PlaySession, getPlaySessionSpanSeconds } from "~/lib/activity/sessions"
import { ActivityClusterBlock } from "./ActivityClusterBlock"
import { secondsToHMS } from "~/util/presentation/formatting"

export const PlaySessionBlock = ({ session }: { session: PlaySession }) => {
    const spanSeconds = getPlaySessionSpanSeconds(session)
    const timeFormatter = new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit"
    })

    return (
        <article className="border-border/40 bg-card/30 overflow-hidden rounded-lg border">
            <header className="border-border/40 bg-muted/15 flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
                <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Session
                </div>
                <div className="text-muted-foreground text-xs tabular-nums sm:text-sm">
                    {timeFormatter.format(session.endedAt)} – {timeFormatter.format(session.startedAt)}
                    {spanSeconds > 0 ? ` · ${secondsToHMS(spanSeconds, false)}` : ""}
                </div>
            </header>

            <div className="flex flex-col gap-2 p-2">
                {session.clusters.map(cluster => (
                    <ActivityClusterBlock key={cluster.id} cluster={cluster} />
                ))}
            </div>
        </article>
    )
}
