/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation"
import { ImageResponse } from "next/og"
import { FallbackSplash } from "~/components/CloudflareImage"
import { getMetaData, prefetchActivity } from "~/lib/pgcr/server"
import { type PGCRPageProps } from "~/lib/pgcr/types"
import { baseUrl } from "~/lib/server/utils"
import { prefetchManifest } from "~/services/raidhub/prefetchRaidHubManifest"
import { bungieIconUrl, getBungieDisplayName } from "~/util/destiny"
import { secondsToHMS } from "~/util/presentation/formatting"

const size = {
    width: 800,
    height: 450
}

export const runtime = "edge"

// Image generation
export default async function Image({ params: { instanceId } }: PGCRPageProps) {
    const interSemiBold = fetch(baseUrl + "/Inter-SemiBold.ttf").then(res => res.arrayBuffer())

    const [activity, manifest] = await Promise.all([
        prefetchActivity(instanceId),
        prefetchManifest()
    ])
    if (!activity) {
        notFound()
    }

    const { ogTitle, dateString } = getMetaData(activity)
    const imageVariants = manifest.splashUrls[activity.activityId]
    const backgroundImageUrl =
        imageVariants?.find(v => v.size === "medium")?.url ??
        imageVariants?.find(v => v.size === "small")?.url ??
        imageVariants?.find(v => v.size === "large")?.url ??
        imageVariants?.[0]?.url ??
        FallbackSplash

    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontFamily: "Inter, sans-serif",
                    color: "white",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                <div
                    style={{
                        backgroundImage: `url(${backgroundImageUrl})`,
                        backgroundSize: "100% 100%",
                        filter: "blur(2px) brightness(0.7)",
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        top: 0,
                        left: 0
                    }}
                />
                <h1
                    style={{
                        textAlign: "center",
                        padding: "0 100px",
                        fontSize: 48,
                        textShadow: "2px 2px 3px black"
                    }}>
                    {ogTitle}
                </h1>
                <div
                    style={{
                        width: activity.playerCount < 4 ? "60%" : "100%",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        fontSize: 24,
                        padding: "10px"
                    }}>
                    {activity.players.slice(0, 6).map(({ playerInfo, ...data }, idx) => (
                        <div
                            key={playerInfo.membershipId}
                            style={{
                                flexBasis:
                                    activity.playerCount < 4
                                        ? "100%"
                                        : activity.playerCount === 5 && idx === 0
                                          ? "55%"
                                          : "48%",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor: "rgba(0, 0, 0, 0.9)",
                                borderRadius: 2,
                                overflow: "hidden",
                                filter:
                                    activity.completed && !data.completed
                                        ? "grayscale(100%) opacity(0.6)"
                                        : "none",
                                color: activity.completed && !data.completed ? "gray" : "white"
                            }}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    gap: 16
                                }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 48,
                                        height: 48
                                    }}>
                                    <img src={bungieIconUrl(playerInfo.iconPath)} alt="" />
                                </div>
                                <div>{getBungieDisplayName(playerInfo)}</div>
                            </div>
                            {data.completed ? (
                                <svg
                                    viewBox="0 0 32 32"
                                    width={32}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="green"
                                    style={{
                                        marginRight: 8
                                    }}>
                                    <polygon points="14 21.414 9 16.413 10.413 15 14 18.586 21.585 11 23 12.415 14 21.414" />
                                    <path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z" />
                                </svg>
                            ) : (
                                <svg
                                    viewBox="0 0 24 24"
                                    width={32}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="rgb(227, 89, 79)"
                                    style={{
                                        marginRight: 8
                                    }}>
                                    <path d="M9.172 16.242 12 13.414l2.828 2.828 1.414-1.414L13.414 12l2.828-2.828-1.414-1.414L12 10.586 9.172 7.758 7.758 9.172 10.586 12l-2.828 2.828z" />
                                    <path d="M12 22c5.514 0 10-4.486 10-10S17.514 2 12 2 2 6.486 2 12s4.486 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8z" />
                                </svg>
                            )}
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: 12
                    }}>
                    <div
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 36,
                            height: 36
                        }}>
                        <img src={baseUrl + "/logo.png"} alt="" />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "flex-start"
                        }}>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: 20
                            }}>
                            RaidHub
                        </h3>
                        <div
                            style={{
                                fontSize: 10
                            }}>
                            {baseUrl}
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16
                    }}>
                    {dateString}
                </div>
                <div
                    style={{
                        position: "absolute",
                        bottom: 16,
                        right: 16
                    }}>
                    {secondsToHMS(activity.duration, false)}
                </div>
                <div
                    style={{
                        position: "absolute",
                        bottom: 16,
                        left: 16,
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                    {activity.leaderboardRank && (
                        <div
                            style={{
                                backgroundColor: "rgb(201, 125, 2)",
                                color: "white",
                                padding: 4,
                                borderRadius: 4
                            }}>
                            {activity.metadata.versionName + " #" + activity.leaderboardRank}
                        </div>
                    )}
                </div>
            </div>
        ),
        {
            status: 200,
            ...size,
            fonts: [
                {
                    name: "Inter",
                    data: await interSemiBold,
                    style: "normal",
                    weight: 400
                }
            ]
        }
    )
}
