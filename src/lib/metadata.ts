import { type Metadata } from "next"
import { baseUrl } from "~/lib/server"

const title: Metadata["title"] = {
    absolute: "RaidHub",
    template: "%s | RaidHub"
}
const description: Metadata["description"] =
    "RaidHub is the fastest Destiny 2 raid analytics site. View dozens of leaderboards, millions of profiles, and millions of raid completions."

export const metadata = {
    title: title,
    description: description,
    icons: {
        shortcut: "/favicon.ico"
    },
    robots: {
        follow: true,
        index: true
    },
    keywords: ["destiny 2", "raidhub", "raid hub", "raid", "leaderboards", "statistics"],
    metadataBase: new URL(baseUrl),
    openGraph: {
        title: title,
        description: description,
        siteName: "RaidHub",
        images: ["/logo.png"] as string[] | undefined,
        type: "website"
    },
    twitter: {
        site: "@raidhubio"
    }
}
