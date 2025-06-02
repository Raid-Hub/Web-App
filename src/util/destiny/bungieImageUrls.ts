/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { type DestinyInventoryItemDefinition } from "bungie-net-core/models"
import {
    defaultBannerEmblem,
    defaultEmblem,
    defaultIcon,
    defaultProfileIcon
} from "~/lib/bungie-images"

const baseBungieUrl = "https://www.bungie.net"

export function bungieIconUrl(path: string | undefined | null) {
    return baseBungieUrl + (path || defaultIcon)
}

export function bungieItemWatermarkUrl(path: string | undefined | null) {
    return baseBungieUrl + (path || defaultIcon)
}

export function bungieProfileIconUrl(path: string | undefined | null) {
    return baseBungieUrl + (path || defaultProfileIcon)
}

export function bungieItemUrl(path: string | undefined) {
    return baseBungieUrl + (path || "")
}

export function bungieEmblemUrl(
    emblem: DestinyInventoryItemDefinition | null | string | undefined
) {
    return (
        baseBungieUrl +
        (typeof emblem === "string" ? emblem : emblem?.secondaryIcon || defaultEmblem)
    )
}

export function bungieBannerEmblemUrl(emblem: DestinyInventoryItemDefinition | null) {
    return baseBungieUrl + (emblem?.secondarySpecial || defaultBannerEmblem)
}

export function bungieClanBannerBannerLayerUrl(path: string | undefined) {
    return baseBungieUrl + (path || "")
}

export function bungiePgcrImageUrl(path: string | undefined) {
    return path ? baseBungieUrl + path : "https://cdn.raidhub.io/content/orbit/medium.jpg"
}
