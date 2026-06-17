"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

const MAX_CONCURRENT_INSTANCE_FETCHES = 3

type ClusterGuardianFetchBudgetContextValue = {
    /** Bumps when slots are claimed or released — use as an effect dependency. */
    revision: number
    tryClaim: (instanceId: string) => boolean
    release: (instanceId: string) => void
}

const ClusterGuardianFetchBudgetContext =
    createContext<ClusterGuardianFetchBudgetContextValue | null>(null)

export function ClusterGuardianFetchBudgetProvider({ children }: { children: ReactNode }) {
    const [claimed, setClaimed] = useState<ReadonlySet<string>>(() => new Set())
    const [revision, setRevision] = useState(0)

    const bump = useCallback(() => {
        setRevision(value => value + 1)
    }, [])

    const tryClaim = useCallback(
        (instanceId: string) => {
            if (claimed.has(instanceId)) {
                return true
            }
            if (claimed.size >= MAX_CONCURRENT_INSTANCE_FETCHES) {
                return false
            }
            setClaimed(prev => new Set(prev).add(instanceId))
            bump()
            return true
        },
        [bump, claimed]
    )

    const release = useCallback(
        (instanceId: string) => {
            setClaimed(prev => {
                if (!prev.has(instanceId)) {
                    return prev
                }
                const next = new Set(prev)
                next.delete(instanceId)
                return next
            })
            bump()
        },
        [bump]
    )

    const value = useMemo(() => ({ revision, tryClaim, release }), [revision, tryClaim, release])

    return (
        <ClusterGuardianFetchBudgetContext.Provider value={value}>
            {children}
        </ClusterGuardianFetchBudgetContext.Provider>
    )
}

export function useClusterGuardianFetchBudget() {
    return useContext(ClusterGuardianFetchBudgetContext)
}
