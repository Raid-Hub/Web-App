"use client"

import { Collection } from "@discordjs/collection"
import { createContext, useContext, useMemo, type ReactNode } from "react"
import { type RaidHubInstanceForPlayer } from "~/services/raidhub/types"

const RaidContext = createContext<
    | {
          raidId: number
          versionId?: number
          isLoadingActivities: false
          activities: Collection<string, RaidHubInstanceForPlayer>
      }
    | { raidId: number; versionId?: number; isLoadingActivities: true; activities: null }
    | null
>(null)

export function useRaidCardContext() {
    const ctx = useContext(RaidContext)
    if (!ctx) throw new Error("No RaidContext found")
    return ctx
}

export const RaidCardContext = ({
    children,
    activities = new Collection(),
    isLoadingActivities,
    raidId,
    versionId
}: {
    children: ReactNode
    activities: Collection<string, RaidHubInstanceForPlayer> | undefined
    isLoadingActivities: boolean
    raidId: number
    /** Pantheon cards pass the encounter version separately from the parent activity id. */
    versionId?: number
}) => {
    const memoizedSortedActivities = useMemo(
        () =>
            activities.toSorted(
                (a, b) => new Date(a.dateCompleted).getTime() - new Date(b.dateCompleted).getTime()
            ),
        [activities]
    )

    return (
        <RaidContext.Provider
            value={{
                raidId,
                versionId,
                ...(isLoadingActivities
                    ? { isLoadingActivities: true, activities: null }
                    : {
                          isLoadingActivities: false,
                          activities: memoizedSortedActivities
                      })
            }}>
            {children}
        </RaidContext.Provider>
    )
}
