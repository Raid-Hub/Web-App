export function formatTimeRangeTitle(startDate: Date, endDate: Date): string {
    const started = startDate.toLocaleString(undefined, { timeZoneName: "short" })
    const ended = endDate.toLocaleString(undefined, { timeZoneName: "short" })
    return `Started: ${started} · Ended: ${ended}`
}
