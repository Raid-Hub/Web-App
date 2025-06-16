"use client"

import type { ClanBanner } from "bungie-net-core/models"
import { useClanBanner } from "~/hooks/dexie"
import { bungieClanBannerBannerLayerUrl } from "~/util/destiny"

const mast =
    "https://cdn.raidhub.io/cdn-cgi/imagedelivery/85AvSk7Z9-QdHfmk4t5dsw/3be0c292-1e86-4206-189a-ab6cd337d900/medium"

export const ClanBannerComponent = ({
    id,
    data,
    sx
}: {
    id: string
    data: ClanBanner
    sx: number
}) => {
    const bannerData = useClanBanner(data)

    const mastWidthRaw = 9.4 * sx
    const mastWidth = `${mastWidthRaw}px`
    const mastHeight = `${mastWidthRaw * (768 / 368)}px`

    const bannerWidthRaw = 9 * sx
    const bannerWidth = `${bannerWidthRaw}px`
    const bannerHeight = `${bannerWidthRaw * (16 / 9)}px`

    const bannerOffset = `${-0.41 * sx}px`
    const bannerCentering = `translate(${(mastWidthRaw - bannerWidthRaw) / 2})`

    return (
        <svg
            key={"banner"}
            style={{ width: mastWidth, height: mastHeight }}
            xmlns="http://www.w3.org/2000/svg">
            <g transform={bannerCentering}>
                <defs>
                    <mask id={`gonfalcons-${id}`}>
                        <image
                            y={bannerOffset}
                            width={bannerWidth}
                            height={bannerHeight}
                            xlinkHref={bungieClanBannerBannerLayerUrl(bannerData.gonfalcons.path)}
                        />
                    </mask>
                    <mask id={`topDecal-${id}`}>
                        <image
                            y={bannerOffset}
                            width={bannerWidth}
                            height={bannerHeight}
                            xlinkHref={bungieClanBannerBannerLayerUrl(bannerData.decalTop.path)}
                            mask={`url(#gonfalcons-${id})`}
                        />
                    </mask>
                    <mask id={`decal2-${id}`}>
                        <image
                            y={bannerOffset}
                            width={bannerWidth}
                            height={bannerHeight}
                            xlinkHref={bungieClanBannerBannerLayerUrl(
                                bannerData.decalSecondary.path
                            )}
                            mask={`url(#gonfalcons-${id})`}
                        />
                    </mask>
                    <mask id={`decal-${id}`}>
                        <image
                            y={bannerOffset}
                            width={bannerWidth}
                            height={bannerHeight}
                            xlinkHref={bungieClanBannerBannerLayerUrl(bannerData.decalPrimary.path)}
                            mask={`url(#gonfalcons-${id})`}
                        />
                    </mask>
                </defs>
                <rect
                    y={bannerOffset}
                    width={bannerWidth}
                    height={bannerHeight}
                    fill={bannerData.gonfalcons.color}
                    mask={`url(#gonfalcons-${id})`}
                />
                <rect
                    y={bannerOffset}
                    width={bannerWidth}
                    height={bannerHeight}
                    fill={bannerData.decalTop.color}
                    mask={`url(#topDecal-${id})`}
                />
                <rect
                    y={bannerOffset}
                    width={bannerWidth}
                    height={bannerHeight}
                    fill={bannerData.decalSecondary.color}
                    mask={`url(#decal2-${id})`}
                />
                <rect
                    y={bannerOffset}
                    width={bannerWidth}
                    height={bannerHeight}
                    fill={bannerData.decalPrimary.color}
                    mask={`url(#decal-${id})`}
                />
            </g>
            <image xlinkHref={mast} width="100%" height="100%" />
        </svg>
    )
}
