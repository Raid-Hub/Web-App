/** Timeline strip for multi-instance PGCR views (session composed of multiple instance IDs). */
export type MultiInstanceTimelineSegment = {
    instanceId: string
    duration: number
    start: Date
    end: Date
    activityName: string
    versionName: string
    completed: boolean
}
