/* eslint-disable jsx-a11y/alt-text, @next/next/no-img-element */
import { ImageResponse } from "next/og"
import { saferFetch } from "~/lib/server/saferFetch"
import { bungieClanBannerBannerLayerUrl } from "~/util/destiny"
import { RGBAToHex } from "~/util/destiny/rgba"
import { getClan, getClanBannerDefinitions, type PageProps } from "../server"

export const runtime = "edge"

const mast =
    "https://cdn.raidhub.io/cdn-cgi/imagedelivery/85AvSk7Z9-QdHfmk4t5dsw/3be0c292-1e86-4206-189a-ab6cd337d900/medium"
const sizeFactor = 50

export default async function Image({ params: { groupId } }: PageProps) {
    const clan = await getClan(groupId)
    if (!clan) return null

    const definitions = await getClanBannerDefinitions()
    const clanBannerData = clan.detail.clanInfo.clanBannerData

    const decalPath = definitions.clanBannerDecals[clanBannerData.decalId]

    const decalPrimaryColor = RGBAToHex(
        definitions.clanBannerDecalPrimaryColors[clanBannerData.decalColorId]
    )
    const decalSecondaryColor = RGBAToHex(
        definitions.clanBannerDecalSecondaryColors[clanBannerData.decalBackgroundColorId]
    )

    const gonfalconsPath = definitions.clanBannerGonfalons[clanBannerData.gonfalonId]
    const gonfalconsColor = RGBAToHex(
        definitions.clanBannerGonfalonColors[clanBannerData.gonfalonColorId]
    )

    const decalTopColor = RGBAToHex(
        definitions.clanBannerGonfalonDetailColors[clanBannerData.gonfalonDetailColorId]
    )
    const decalTopPath = definitions.clanBannerGonfalonDetails[clanBannerData.gonfalonDetailId]

    const mastWidthRaw = Math.round(9.4 * sizeFactor)
    const mastHeightRaw = Math.round(mastWidthRaw * (768 / 368))
    const mastWidth = `${mastWidthRaw}px`
    const mastHeight = `${mastHeightRaw}px`

    const bannerWidthRaw = Math.round(9 * sizeFactor)
    const bannerHeightRaw = Math.round(bannerWidthRaw * (16 / 9))
    const bannerWidth = `${bannerWidthRaw}px`
    const bannerHeight = `${bannerHeightRaw}px`

    const viewBoxHeight = mastHeightRaw * 0.73

    const bannerOffset = Math.round((-4 / 9) * sizeFactor)
    const bannerCentering = (mastWidthRaw - bannerWidthRaw) / 2

    const [gonfalconsBase64, decalTopBase64, decalPrimaryBase64, decalSecondaryBase64] = (
        await Promise.all(
            [
                bungieClanBannerBannerLayerUrl(gonfalconsPath),
                bungieClanBannerBannerLayerUrl(decalTopPath),
                bungieClanBannerBannerLayerUrl(decalPath?.foregroundPath),
                bungieClanBannerBannerLayerUrl(decalPath?.backgroundPath)
            ].map(imageToBase64)
        )
    ).map(base64 => `data:image/png;base64,${base64}`)

    const svgText = `
        <svg
            viewBox="0 0 ${mastWidthRaw} ${viewBoxHeight}"
            style="width: ${mastWidth}; height: ${viewBoxHeight};"
            xmlns="http://www.w3.org/2000/svg">
            <g>
                <defs>
                    <mask id="gonfalcons">
                        <image
                            x="${bannerCentering}"
                            y="${bannerOffset}"
                            width="${bannerWidth}"
                            height="${bannerHeight}"
                            href="${gonfalconsBase64}"
                        />
                    </mask>
                    <mask id="topDecal">
                        <image
                            x="${bannerCentering}"
                            y="${bannerOffset}"
                            width="${bannerWidth}"
                            height="${bannerHeight}"
                            href="${decalTopBase64}"
                            mask="url(#gonfalcons)"
                        />
                    </mask>
                    <mask id="decal2">
                        <image
                            x="${bannerCentering}"
                            y="${bannerOffset}"
                            width="${bannerWidth}"
                            height="${bannerHeight}"
                            href="${decalSecondaryBase64}"
                            mask="url(#gonfalcons)"
                        />
                    </mask>
                    <mask id="decal">
                        <image
                            x="${bannerCentering}"
                            y="${bannerOffset}"
                            width="${bannerWidth}"
                            height="${bannerHeight}"
                            href="${decalPrimaryBase64}"
                            mask="url(#gonfalcons)"
                        />
                    </mask>
                </defs>
                <rect
                    x="${bannerCentering}"
                    y="${bannerOffset}"
                    width="${bannerWidth}"
                    height="${bannerHeight}"
                    fill="${gonfalconsColor}"
                    mask="url(#gonfalcons)"
                />
                <rect
                    x="${bannerCentering}"
                    y="${bannerOffset}"
                    width="${bannerWidth}"
                    height="${bannerHeight}"
                    fill="${decalTopColor}"
                    mask="url(#topDecal)"
                />
                <rect
                    x="${bannerCentering}"
                    y="${bannerOffset}"
                    width="${bannerWidth}"
                    height="${bannerHeight}"
                    fill="${decalSecondaryColor}"
                    mask="url(#decal2)"
                />
                <rect
                    x="${bannerCentering}"
                    y="${bannerOffset}"
                    width="${bannerWidth}"
                    height="${bannerHeight}"
                    fill="${decalPrimaryColor}"
                    mask="url(#decal)"
                />
            </g>
        </svg>
        `
        .replace(/\s+/g, " ")
        .trim()

    return new ImageResponse(
        (
            <div
                style={{
                    display: "flex",
                    position: "relative"
                }}>
                <img
                    style={{
                        width: mastWidth,
                        height: viewBoxHeight,
                        position: "absolute"
                    }}
                    src={`data:image/svg+xml,${svgText}`}
                />
                <img
                    style={{
                        width: mastWidth,
                        height: mastHeight,
                        position: "absolute"
                    }}
                    src={mast}
                />
            </div>
        ),
        {
            status: 200,
            width: mastWidthRaw,
            height: viewBoxHeight
        }
    )
}

async function imageToBase64(imageUrl: string) {
    const response = await saferFetch(imageUrl, {
        cache: "force-cache"
    })
    const buffer = await response.arrayBuffer()
    return Buffer.from(buffer).toString("base64")
}
