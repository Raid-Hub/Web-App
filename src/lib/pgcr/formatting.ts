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
