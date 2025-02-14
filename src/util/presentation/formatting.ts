import { round } from "../math"

export function formattedNumber(num: number, locale: string, places = 2): string {
    return round(num, places).toLocaleString(locale)
}

export function truncatedNumber(num: number, locale: string): string {
    if (num < 100000) {
        return formattedNumber(num, locale)
    } else if (num < 1000000) {
        return formattedNumber(Math.floor(num / 1000), locale) + "k"
    } else {
        return formattedNumber(Math.floor(num / 1000000), locale) + "M"
    }
}

export function toCustomDateString(date: Date, locale: string): string {
    return date.toLocaleDateString(locale, {
        month: "long",
        day: "numeric",
        year: "numeric"
    })
}
export function toCustomTimeString(date: Date, locale: string): string {
    return date.toLocaleTimeString(locale, {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric"
    })
}

export function formattedTimeSince(date: Date, locale: string | undefined = undefined): string {
    const now = new Date()
    const secondsPast = Math.floor((now.getTime() - date.getTime()) / 1000)
    const absSecondsPast = Math.abs(secondsPast)

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

    if (absSecondsPast < 60) {
        return rtf.format(-secondsPast, "second")
    }
    if (absSecondsPast < 3600) {
        return rtf.format(-Math.floor(secondsPast / 60), "minute")
    }
    if (absSecondsPast < 86400) {
        return rtf.format(-Math.floor(secondsPast / 3600), "hour")
    }
    if (absSecondsPast < 2592000) {
        return rtf.format(-Math.floor(secondsPast / 86400), "day")
    }
    if (absSecondsPast < 31536000) {
        return rtf.format(-Math.floor(secondsPast / 2592000), "month")
    }
    return rtf.format(-Math.floor(secondsPast / 31536000), "year")
}

export function secondsToString(seconds: number): string {
    const time = Math.round(seconds)
    if (time < 60) {
        return `${time} second${time >= 2 ? "s" : ""}`
    } else if (time < 3600) {
        return `${Math.floor(time / 60)} minute${time >= 120 ? "s" : ""}`
    } else {
        return `${Math.floor(time / 3600)} hour${time >= 7200 ? "s" : ""}`
    }
}

export function secondsToHMS(seconds: number, alwaysIncludeSeconds: boolean): string {
    let time = Math.round(seconds)
    const hours = Math.floor(time / 3600)
    time -= hours * 3600
    const minutes = Math.floor(time / 60)
    time -= minutes * 60
    return `${hours ? hours + "h" : ""} ${hours || minutes ? minutes + "m" : ""}${
        !hours || alwaysIncludeSeconds ? ` ${time + "s"}` : ""
    }`
}

export function secondsToYDHMS(totalSeconds: number, count = 5): string {
    let time = Math.round(totalSeconds)
    const seconds = time % 60
    time -= seconds
    time /= 60

    const minutes = time % 60
    time -= minutes
    time /= 60

    const hours = time % 24
    time -= hours
    time /= 24

    const days = time % 365
    time -= days
    time /= 365

    const years = time
    const result = [
        years ? years + "y" : "",
        days ? days + "d" : "",
        hours ? hours + "h" : "",
        minutes ? minutes + "m" : "",
        seconds ? seconds + "s" : ""
    ].filter(Boolean)

    if (!result.length) {
        result.push("0s")
    }

    return result.slice(0, count).join(" ")
}

const domParser = typeof window !== "undefined" ? new DOMParser() : null
export const decodeHtmlEntities = (html: string) => {
    if (typeof window === "undefined") return html
    const doc = domParser!.parseFromString(html, "text/html")
    return doc.body.textContent ?? ""
}
