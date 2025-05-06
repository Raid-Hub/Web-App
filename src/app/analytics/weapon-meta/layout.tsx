import { type ReactNode } from "react"
import { baseMetadata } from "~/lib/metadata"

export default function Layout({ children }: { children: ReactNode }) {
    return <>{children}</>
}

const title = "Weapon Meta"
const description = "View the weekly raiding meta for weapons in Destiny 2"

export const metadata = {
    title,
    description,
    keywords: [...baseMetadata.keywords, "weapons", "meta", "analytics"],
    openGraph: {
        ...baseMetadata.openGraph,
        title,
        description
    }
}
