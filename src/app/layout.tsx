import type { Viewport } from "next"
import dynamic from "next/dynamic"
import NextTopLoader from "nextjs-toploader"
import { type ReactNode } from "react"
import { prefetchManifest } from "~/services/raidhub/prefetchRaidHubManifest"
import { Toaster } from "~/shad/sonner"
import "./global.css"
import { Footer } from "./layout/footer/Footer"
import { Header } from "./layout/header/Header"
import { HeaderContent } from "./layout/header/HeaderContent"
import { DestinyServiceStatusBanner } from "./layout/overlays/DestinyServiceStatusBanner"
import { DonationBanner } from "./layout/overlays/DonationBanner"
import { RaidHubStatusBanner } from "./layout/overlays/RaidHubStatusBanner"
import { SearchModal } from "./layout/overlays/SearchModal"
import { ClientComponentManager } from "./layout/wrappers/ClientComponentManager"
import { LocaleManager } from "./layout/wrappers/LocaleManager"
import { QueryManager } from "./layout/wrappers/QueryManager"
import { RaidHubManifestManager } from "./layout/wrappers/RaidHubManifestManager"
import { BungieClientProvider } from "./layout/wrappers/session/BungieClientProvider"
import { SessionManager } from "./layout/wrappers/session/ServerSessionManager"

// Dynamic import for the dexie DB
const DestinyManifestManager = dynamic(() => import("./layout/wrappers/DestinyManifestManager"))

export const preferredRegion = ["iad1"] // us-east-1
export const runtime = "nodejs"
export const fetchCache = "default-no-store"
export const revalidate = false
export const maxDuration = 10 // max lambda duration in seconds

export default async function RootLayout(params: { children: ReactNode }) {
    const manifest = await prefetchManifest()

    return (
        <html className="dark" suppressHydrationWarning>
            <head>
                <meta name="discord:site" content="https://discord.gg/raidhub" />

                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <QueryManager>
                    <BungieClientProvider>
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
