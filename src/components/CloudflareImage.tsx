import Image, { type ImageLoader } from "next/image"
import { type ComponentPropsWithoutRef } from "react"
import { HomePageSplash, R2RaidSplash } from "~/lib/activity-images"
import { VaultEmblems } from "~/lib/bungie-foundation-emblems"

const cloudflareVariants = [
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
] as const satisfies { name: string; w: number; h: number }[]

const CloudflareImages = {
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
    ...R2RaidSplash,
    ...VaultEmblems,
    ...HomePageSplash
} as const satisfies Record<
    string,
    { path: string; variants: Partial<Record<(typeof cloudflareVariants)[number]["name"], string>> }
>

export type CloudflareImageId = keyof typeof CloudflareImages

export const cloudflareImageLoader: ImageLoader = ({ src: id, width, quality }) => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const minWidth = (width * (quality || 75)) / 100

    const img = CloudflareImages[id as keyof typeof CloudflareImages]

    const variants = cloudflareVariants.filter(item => item.name in img.variants)
    const variant = (variants.find(item => item.w >= minWidth) ?? variants[variants.length - 1])
        .name

    return `https://cdn.raidhub.io/content/${img.path}/${
        img.variants[variant as keyof typeof img.variants]
    }`
}

export const CloudflareImage = ({
    cloudflareId,
    alt = "",
    ...props
}: { cloudflareId: keyof typeof CloudflareImages } & Omit<
    ComponentPropsWithoutRef<typeof Image>,
    "src" | "loader"
>) => <Image loader={cloudflareImageLoader} {...props} src={cloudflareId} alt={alt} />

export const cloudflareIconLoader: ImageLoader = ({ src: path }) => {
    return `https://cdn.raidhub.io/content/${path.startsWith("/") ? path.slice(1) : path}`
}

export const CloudflareIcon = ({
    path,
    alt = "",
    ...props
}: { path: string } & Omit<ComponentPropsWithoutRef<typeof Image>, "src" | "loader">) => (
    <Image loader={cloudflareIconLoader} {...props} src={path} alt={alt} />
)
