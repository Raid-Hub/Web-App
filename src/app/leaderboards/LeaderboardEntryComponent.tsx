"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef } from "react"
import { useLocale } from "~/components/providers/LocaleManager"
import { useQueryParams } from "~/hooks/util/useQueryParams"
import { cn } from "~/lib/tw"
import { formattedNumber, secondsToYDHMS, truncatedNumber } from "~/util/presentation/formatting"
import { type LeaderboardEntry } from "./LeaderboardEntries"
import { LeaderboardEntryPlayerComponent } from "./LeaderboardEntryPlayer"

export const LeaderboardEntryComponent = ({
    placementIcon,
    isTargetted,
    valueFormat,
    ...entry
}: LeaderboardEntry & {
    isTargetted: boolean
    placementIcon?: JSX.Element
}) => {
    const { remove } = useQueryParams<{
        position: string
    }>()
    const { locale } = useLocale()
    const value =
        valueFormat === "duration"
            ? secondsToYDHMS(entry.value, 3)
            : formattedNumber(entry.value, locale, 3)

    const lg = useRef<HTMLDivElement>(null)
    const sm = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isTargetted) {
            if (lg.current && lg.current.getBoundingClientRect().width > 0) {
                lg.current.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "center"
                })
            } else if (sm.current && sm.current.getBoundingClientRect().width > 0) {
                sm.current.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "center"
                })
            }
        }
    }, [isTargetted, remove])

    const targettedStyle = useMemo(
        () =>
            isTargetted
                ? {
                      border: "2px solid orange"
                  }
                : undefined,
        [isTargetted]
    )

    return (
        <div
            ref={sm}
            className={cn(
                "bg-card relative flex w-full flex-col items-center rounded border p-2 shadow-md transition-transform hover:scale-105 lg:flex-row lg:justify-between",
                { "max-w-[450px]": entry.type === "player" }
            )}
            style={targettedStyle}>
            {entry.url && (
                <Link
                    href={entry.url}
                    target={entry.url.startsWith("/") ? undefined : "_blank"}
                    aria-label={`View details for ${value}`}
                    className="absolute inset-0 rounded"
                />
            )}

            {/* Left side */}
            <div className="pointer-events-none relative z-10 flex-1">
                {/* Players */}
                <div className="flex gap-4 p-2">
                    <div className="flex aspect-square min-w-5 flex-col justify-center text-lg">
                        {placementIcon ?? truncatedNumber(entry.rank, locale)}
                    </div>

                    {entry.type === "player" ? (
                        <LeaderboardEntryPlayerComponent {...entry.player} />
                    ) : (
                        // team entry
                        <div className="grid w-full gap-2 sm:grid-cols-3 2xl:grid-cols-6">
                            {entry.team.map(player => (
                                <LeaderboardEntryPlayerComponent key={player.id} {...player} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right side (timestamp / value) */}
            <div className="w-28 p-2">{value}</div>
        </div>
    )
}
