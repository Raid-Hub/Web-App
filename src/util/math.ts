import { Collection } from "@discordjs/collection"

export function round(val: number, places: number): number {
    const factor = 10 ** places
    return Math.round(val * factor) / factor
}

export function median(sortedArr: number[]): number {
    const mid = (sortedArr.length - 1) / 2
    if (mid % 1 === 0) {
        return sortedArr[mid]
    } else {
        return (sortedArr[Math.floor(mid)] + sortedArr[Math.ceil(mid)]) / 2
    }
}

export function medianElement<E>(sortedCollection: Collection<any, E>): E {
    const mid = (sortedCollection.size - 1) / 2
    if (mid % 1 === 0) {
        return sortedCollection.at(mid)!
    } else {
        return sortedCollection.at(Math.ceil(mid))!
    }
}
