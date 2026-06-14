import Link from "next/link"
import { useCallback, useMemo } from "react"
import { useDebouncedHover } from "~/hooks/util/useDebouncedHover"
import { Tag } from "~/models/tag"
import styles from "./raids.module.css"

/** @deprecated */
const RaceTagLabel = ({
    rank,
    isGauntletRace,
    versionLabel,
    isChallenge,
    isDayOne,
    isContest,
    isWeekOne,
    instanceId,
    setActiveId
}: {
    rank: number | null
    instanceId: string
    isGauntletRace?: boolean
    versionLabel?: string | null
    isChallenge: boolean
    isDayOne: boolean
    isContest: boolean
    isWeekOne: boolean
    setActiveId: (instanceId: string) => void
}) => {
    const label = useRaceLabel({
        rank,
        isGauntletRace,
        versionLabel,
        isChallenge,
        isDayOne,
        isContest,
        isWeekOne
    })

    const hoverAction = useCallback(() => {
        if (instanceId) setActiveId(instanceId)
    }, [instanceId, setActiveId])

    const { handleHover, handleLeave } = useDebouncedHover({ action: hoverAction, debounce: 750 })

    return label ? (
        <Link
            className={styles["race-tag"]}
            href={`/pgcr/${instanceId}`}
            onMouseEnter={handleHover}
            onMouseLeave={handleLeave}>
            <span>{label}</span>
        </Link>
    ) : null
}

const useRaceLabel = (props: {
    rank: number | null
    isGauntletRace?: boolean
    versionLabel?: string | null
    isChallenge: boolean
    isDayOne: boolean
    isContest: boolean
    isWeekOne: boolean
}): string | null => {
    const tag = useMemo(() => {
        if (props.isGauntletRace) {
            return Tag.GAUNTLET_RACE
        } else if (props.isChallenge) {
            return Tag.CHALLENGE
        } else if (props.isDayOne) {
            return Tag.DAY_ONE
        } else if (props.isContest) {
            return Tag.CONTEST
        } else if (props.isWeekOne) {
            return Tag.WEEK_ONE
        } else if (props.versionLabel) {
            return props.versionLabel
        } else {
            return null
        }
    }, [
        props.isGauntletRace,
        props.versionLabel,
        props.isChallenge,
        props.isDayOne,
        props.isContest,
        props.isWeekOne
    ])

    if (tag) {
        return `${tag}${props.rank ? ` #${props.rank}` : ""}`
    } else {
        return null
    }
}
export default RaceTagLabel
