"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useLocale } from "~/components/providers/LocaleManager"
import { useInterval } from "~/hooks/util/useInterval"
import { Button } from "~/shad/button"

export const ClientControls = ({ refreshedAt }: { refreshedAt: Date }) => {
    const { locale } = useLocale()
    const [isRefreshDisabled, setIsRefreshDisabled] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const timer = setTimeout(() => setIsRefreshDisabled(false), 2000)
        return () => clearTimeout(timer)
    }, [])

    const refetch = useCallback(() => {
        router.refresh()
        setIsRefreshDisabled(true)
        setTimeout(() => setIsRefreshDisabled(false), 5000)
    }, [router])

    useInterval(65_000, refetch)

    return (
        <div className="flex items-center justify-between gap-4 self-end">
            <div>
                <div className="text-muted-foreground text-xs">Last Refresh</div>
                <div className="font-medium">{refreshedAt.toLocaleTimeString(locale)}</div>
            </div>
            <Button disabled={isRefreshDisabled} onClick={refetch} variant="outline">
                Refresh
            </Button>
        </div>
    )
}
