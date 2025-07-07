/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { X } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { CloudflareImage, type CloudflareImageId } from "~/components/CloudflareImage"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"

const eventName = "Bungie Day 2025"
const localStorageKey = "bungieDay2025BannerDismissDate"
const campaignUrl = "https://tiltify.com/@raidhub/bungie-day-2025"
const donateUrl = "https://donate.tiltify.com/917cb375-cc2a-4377-9ee6-5e75600b9567/incentives"
const banner: CloudflareImageId = "bungieFoundation"

// const allG2GEmblems = o.entries(VaultEmblems)

export const BungieFoundationBanner = () => {
    // const [randomIdx, setRandomIdx] = useState(
    //     () => 1 + Math.floor(Math.random() * (allG2GEmblems.length - 1))
    // )

    // useInterval(15_000, () => {
    //     setRandomIdx(old => 1 + ((old + 1) % (allG2GEmblems.length - 1)))
    // })

    const [g2gBannerDismissDate, setG2gBannerDismissDate] = useLocalStorage<string | null>(
        localStorageKey,
        null
    )

    const dismissedBannerDate = useMemo(
        () => (g2gBannerDismissDate ? new Date(g2gBannerDismissDate) : new Date(0)),
        [g2gBannerDismissDate]
    )

    const oneWeekAgo = useMemo(() => {
        const d = new Date()
        d.setDate(d.getDate() - 7)
        return d
    }, [])

    const shouldShowBanner = dismissedBannerDate < oneWeekAgo

    if (!shouldShowBanner) return null

    return (
        <div className="border-border-dark bg-background/30 text-primary relative w-full border px-2 py-2 text-sm font-semibold tracking-wide sm:text-base">
            <div className="mx-auto flex max-w-screen-xl flex-wrap items-center gap-8 px-6">
                <div className="max-w-150 basis-100">
                    <a href={campaignUrl} target="_blank">
                        <CloudflareImage
                            cloudflareId={banner}
                            priority
                            alt={eventName}
                            height={500}
                            width={1500}
                        />
                    </a>
                    <DonateButton />
                </div>

                <div className="min-w-[320px] flex-2 space-y-4">
                    <div className="flex flex-wrap gap-8 font-normal max-sm:flex-col max-sm:gap-4">
                        <p className="min-w-30 flex-1">
                            This year, as a part of <strong>{eventName}</strong>, RaidHub is raising
                            money for the{" "}
                            <Link
                                href="https://bungiefoundation.org/"
                                className="underline underline-offset-2">
                                Bungie Foundation
                            </Link>
                            . Click the &quot;donate&quot; button to see the specific Bungie rewards
                            and incentives available.
                        </p>
                        <p className="min-w-30 flex-1">
                            This year, we are collaborating with other Destiny 2 API developers to
                            offer the{" "}
                            <a
                                className="text-yellow-300"
                                href="https://donate.tiltify.com/917cb375-cc2a-4377-9ee6-5e75600b9567/incentives?rewardPublicId=a20d75dc-5d22-49cf-b507-a802d66d0d63"
                                target="_blank">
                                D2 DEVS MEGAPACK!!!!
                            </a>
                            , a bundle of unique perks across all your favorite D2 API tools,
                            including <span className="text-blue-300">GM Report</span>,{" "}
                            <span className="text-red-300">Trials Report</span>,{" "}
                            <span className="text-pink-300">Braytech</span>, and more!
                        </p>
                        <p className="min-w-30 flex-1">
                            As a form of gratitude, all those who choose to donate through
                            RaidHub&apos;s fundraiser will also be eligible to receive a{" "}
                            <strong>profile badge</strong> at the end of the event.
                        </p>
                    </div>

                    {/* emblem carousel */}
                    {/* <div className="flex items-center gap-4">
                        <div className="relative hidden aspect-[474/96] min-h-8 flex-1 md:block">
                            <CloudflareImage
                                cloudflareId="darkHeroNameplate"
                                fill
                                alt="Dark Hero Nameplate"
                            />
                        </div>

                        <DonateButton />
                    
                        <m.div
                            key={allG2GEmblems[randomIdx][0]}
                            className="relative hidden aspect-[474/96] min-h-8 flex-1 md:block"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: Array(26).fill(1).concat([0])
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}>
                            <CloudflareImage
                                cloudflareId={allG2GEmblems[randomIdx][0]}
                                fill
                                alt={allG2GEmblems[randomIdx][0]}
                            />
                        </m.div>
                    </div> */}
                </div>

                <X
                    onClick={() => setG2gBannerDismissDate(new Date().toISOString())}
                    className="absolute top-0 right-0 size-8 cursor-pointer rounded p-2 text-white hover:bg-white/10"
                />
            </div>
        </div>
    )
}

const DonateButton = () => (
    <Link
        href={donateUrl}
        className="bg-blue-600 px-4 py-2 text-lg font-semibold text-white uppercase transition hover:bg-blue-700">
        Donate
    </Link>
)
