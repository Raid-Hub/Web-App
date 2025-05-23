export function getRelativeTime(date: Date) {
    const now = Date.now()
    const diff = now - date.getTime()

    const seconds = Math.floor(diff / 1000)
    if (seconds <= 100) {
        return seconds + "s ago"
    }

    const minutes = Math.floor(diff / (1000 * 60))
    if (minutes <= 60) {
        return minutes + "m ago"
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours <= 48) {
        return hours + "h ago"
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days <= 28) {
        return days + "d ago"
    }

    const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7))
    const years = Math.floor(weeks / 52)
    if (years > 0) {
        return years + "y " + (weeks - years * 52) + "w ago"
    } else {
        return weeks + "w ago"
    }
}
