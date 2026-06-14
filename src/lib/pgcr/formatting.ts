import { round } from "~/util/math"

/** Max value stored for `time_played_seconds` (Postgres smallint). ~9h 6m 7s. */
export const TIME_PLAYED_SECONDS_MAX = 32767

export const isTimePlayedSaturated = (timePlayedSeconds: number) =>
    timePlayedSeconds >= TIME_PLAYED_SECONDS_MAX

export const getActivityParticipationPercentage = (
    timePlayedSeconds: number,
    durationSeconds: number
): number | null => {
    if (isTimePlayedSaturated(timePlayedSeconds) || durationSeconds <= 0) {
        return null
    }

    return round(100 * (Math.min(timePlayedSeconds, durationSeconds) / durationSeconds), 0)
}

export const formatTeamSharePercentage = (
    playerValue: number,
    teamTotal: number,
    fractionDigits = 1
): string | null => {
    if (teamTotal <= 0) {
        return null
    }

    return `${((playerValue / teamTotal) * 100).toFixed(fractionDigits)}%`
}

/** Player K/D lift relative to the team average K/D (0% = average). */
export const formatKdRelativeToAveragePercentage = (
    playerKd: number,
    teamAverageKd: number
): string | null => {
    if (teamAverageKd <= 0) {
        return null
    }

    const lift = (playerKd / teamAverageKd - 1) * 100
    const rounded = lift.toFixed(0)
    return lift >= 0 ? `+${rounded}%` : `${rounded}%`
}

type PgcrTitleMetadata = {
    isRaid: boolean
    activityName: string
    versionName: string
}

/** Pantheon activity names include a season suffix (e.g. "Pantheon: Monument of Triumph"). */
export const getPgcrShortActivityName = (activityName: string) => {
    const colonIndex = activityName.indexOf(":")
    return colonIndex === -1 ? activityName : activityName.slice(0, colonIndex).trim()
}

export const getPgcrDisplayTitle = ({ isRaid, activityName, versionName }: PgcrTitleMetadata) => {
    if (isRaid) {
        return activityName
    }

    return `${getPgcrShortActivityName(activityName)}: ${versionName}`
}
