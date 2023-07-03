import { useCallback, useEffect, useState } from "react"
import { ErrorHandler } from "../../types/generic"
import CustomError, { ErrorCode } from "../../models/errors/CustomError"
import { getPGCR } from "../../services/bungie/getPGCR"
import DestinyPGCR from "../../models/pgcr/PGCR"
import { useBungieClient } from "../../components/app/TokenManager"

type useActivityParams = {
    activityId: string | null | undefined
    errorHandler: ErrorHandler
}
type UseActivity = {
    pgcr: DestinyPGCR | null
    isLoading: boolean
}

export function useActivity({ activityId, errorHandler }: useActivityParams): UseActivity {
    const [pgcr, setPGCR] = useState<DestinyPGCR | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const client = useBungieClient()

    const fetchData = useCallback(
        async (activityId: string) => {
            setPGCR(null)
            try {
                const pgcr = await getPGCR({ activityId, client })
                setPGCR(pgcr)
            } catch (e) {
                CustomError.handle(errorHandler, e, ErrorCode.ActivityError)
            } finally {
                setIsLoading(false)
            }
        },
        [client, errorHandler]
    )

    useEffect(() => {
        setIsLoading(true)

        if (activityId) {
            fetchData(activityId)
        } else if (activityId === null) {
            setIsLoading(false)
        }
    }, [activityId, fetchData])

    return { pgcr, isLoading }
}