"use client"

import Image, { type ImageLoader } from "next/image"
import { useCallback, type ComponentPropsWithoutRef } from "react"
import { HomePageSplash } from "~/lib/activity-images"
import { VaultEmblems } from "~/lib/bungie-foundation-emblems"
import { type ImageSize } from "~/services/raidhub/types"
import { useRaidHubManifest } from "./providers/RaidHubManifestManager"

const cloudflareVariants: {
    name: ImageSize
    w: number
    h: number
}[] = [
    { name: "tiny", w: 320, h: 180 },
    {
        name: "small",
        w: 640,
        h: 360
    },
    {
        name: "medium",
        w: 1366,
        h: 768
    },
    {
        name: "large",
        w: 1920,
        h: 1080
    },
    {
        name: "xlarge",
        w: 2560,
        h: 1440
    }
]

export const FallbackSplash = "https://cdn.raidhub.io/content/splash/pantheon/medium.png"

const CloudflareStaticImages = {
    raidhubCitySplash: {
        path: "splash/raidhub/city",
        variants: {
            tiny: "tiny.avif",
            small: "small.avif",
            medium: "medium.avif",
            large: "large.avif"
        }
    },
    g2gBanner: {
        path: "g2g/banner",
        variants: {
            tiny: "tiny.png",
            small: "small.png",
            medium: "medium.png",
            large: "large.png"
        }
    },
    bungieFoundation: {
        path: "bungieFoundation/banner",
        variants: {
            tiny: "tiny.png",
            small: "small.png",
            medium: "medium.png"
        }
    },
    genericRaidSplash: {
        path: "splash/pantheon",
        variants: {
            small: "small.png",
            large: "large.png"
        }
    },
    ...VaultEmblems,
    ...HomePageSplash
} as const satisfies Record<
    string,
    { path: string; variants: Partial<Record<(typeof cloudflareVariants)[number]["name"], string>> }
>

export type CloudflareStaticImageId = keyof typeof CloudflareStaticImages

export const cloudflareStaticImageLoader: ImageLoader = ({ src: id, width, quality }) => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const minWidth = (width * (quality || 75)) / 100

    const img = CloudflareStaticImages[id as CloudflareStaticImageId]

    const variants = cloudflareVariants.filter(item => item.name in img.variants)
    const variant = (variants.find(item => item.w >= minWidth) ?? variants[variants.length - 1])
        .name

    return `https://cdn.raidhub.io/content/${img.path}/${
        img.variants[variant as keyof typeof img.variants]
    }`
}

type StrippedImageProps = Omit<ComponentPropsWithoutRef<typeof Image>, "alt" | "src" | "loader"> & {
    alt?: string
}

export const CloudflareStaticImage = ({
    cloudflareId,
    alt = "",
    ...props
}: { cloudflareId: CloudflareStaticImageId } & StrippedImageProps) => (
    <Image loader={cloudflareStaticImageLoader} {...props} src={cloudflareId} alt={alt} />
)

export const cloudflareIconLoader: ImageLoader = ({ src: path }) => {
    return `https://cdn.raidhub.io/content/${path.startsWith("/") ? path.slice(1) : path}`
}

export const CloudflareIcon = ({
    path,
    alt = "",
    ...props
}: { path: string } & StrippedImageProps) => (
    <Image loader={cloudflareIconLoader} {...props} src={path} alt={alt} />
)

export const CloudflareActivitySplash = ({
    activityId,
    alt,
    ...props
}: { activityId: number } & StrippedImageProps) => {
    const { getImageVariantsForActivity, getActivityDefinition, getVersionString } =
        useRaidHubManifest()

    const loader = useCallback<ImageLoader>(
        ({ width, quality }) => {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const minWidth = (width * (quality || 75)) / 100

            const activityVariants = getImageVariantsForActivity(activityId)
            if (!activityVariants?.length) {
                return FallbackSplash
            }

            console.log("Activity variants", activityVariants)

            const availableSizes = new Set(activityVariants.map(c => c.size))

            const variants = cloudflareVariants.filter(item => availableSizes.has(item.name))
            const size = (
                variants.find(item => item.w >= minWidth && availableSizes.has(item.name)) ??
                variants[variants.length - 1]
            ).name
            const content = activityVariants.find(c => c.size === size)!

            return content.url
        },
        [activityId, getImageVariantsForActivity]
    )

    const activityDefinition = getActivityDefinition(activityId)
    const altText =
        alt ??
        (activityDefinition?.isRaid
            ? activityDefinition.name
            : (getVersionString(activityId) + getActivityDefinition(activityId)?.name ?? ""))

    return <Image loader={loader} {...props} src="placeholder" alt={altText} />
}
