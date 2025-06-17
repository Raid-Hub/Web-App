import type { Viewport } from "next"
import dynamic from "next/dynamic"
import NextTopLoader from "nextjs-toploader"
import { type ReactNode } from "react"
import { DestinyServiceStatusBanner } from "~/components/overlays/DestinyServiceStatusBanner"
import { DonationBanner } from "~/components/overlays/DonationBanner"
import { RaidHubStatusBanner } from "~/components/overlays/RaidHubStatusBanner"
import { SearchModal } from "~/components/overlays/SearchModal"
import { ClientComponentManager } from "~/components/providers/ClientComponentManager"
import { LocaleManager } from "~/components/providers/LocaleManager"
import { QueryManager } from "~/components/providers/QueryManager"
import { RaidHubManifestManager } from "~/components/providers/RaidHubManifestManager"
import { BungieClientProvider } from "~/components/providers/session/BungieClientProvider"
import { SessionManager } from "~/components/providers/session/ServerSessionManager"
import { prefetchManifest } from "~/services/raidhub/prefetchRaidHubManifest"
import { Toaster } from "~/shad/sonner"
import { TooltipProvider } from "~/shad/tooltip"
import Footer from "./footer"
import "./global.css"
import { Header } from "./header/Header"
import { HeaderContent } from "./header/HeaderContent"

// Dynamic import for the dexie DB
const DestinyManifestManager = dynamic(
    () => import("~/components/providers/DestinyManifestManager")
)

export const preferredRegion = ["iad1"] // us-east-1
export const runtime = "nodejs"
export const fetchCache = "default-no-store"
export const revalidate = false
export const maxDuration = 10 // max lambda duration in seconds

export default async function RootLayout(params: { children: ReactNode }) {
    const manifest = await prefetchManifest()

    return (
        <html
            className="dark min-w-75 overflow-y-auto [overscroll-behavior-y:contain]"
            suppressHydrationWarning>
            <head>
                <meta name="discord:site" content="https://discord.gg/raidhub" />

                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="relative m-0 flex min-h-[100svh] flex-col font-[Manrope,sans-serif]">
                <QueryManager>
                    <BungieClientProvider>
                        <TooltipProvider>
                            <SessionManager>
                                <LocaleManager>
                                    <ClientComponentManager>
                                        <DestinyManifestManager>
                                            <RaidHubManifestManager serverManifest={manifest}>
                                                <Header>
                                                    <NextTopLoader
                                                        showSpinner={false}
                                                        speed={700}
                                                        height={3}
                                                        color={"orange"}
                                                    />
                                                    <HeaderContent />
                                                </Header>
                                                <DonationBanner />
                                                {/* <G2GBanner /> */}
                                                <DestinyServiceStatusBanner />
                                                <RaidHubStatusBanner />
                                                <SearchModal />
                                                {params.children}
                                                <Footer />
                                                <Toaster />
                                            </RaidHubManifestManager>
                                        </DestinyManifestManager>
                                    </ClientComponentManager>
                                </LocaleManager>
                            </SessionManager>
                        </TooltipProvider>
                    </BungieClientProvider>
                </QueryManager>
            </body>
        </html>
    )
}

export { baseMetadata as metadata } from "~/lib/metadata"

export const viewport: Viewport = {
    colorScheme: "dark",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#000000"
}
