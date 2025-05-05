import { type ReactNode } from "react"
import { baseMetadata } from "~/lib/metadata"

export default function Layout({ children }: { children: ReactNode }) {
    return <>{children}</>
}

const title = "Player Population"
const description = "View the population of players in Destiny 2 raids over time"

export const metadata = {
    title,
    description,
    keywords: [...baseMetadata.keywords, "population", "graph", "analytics", "chart"],
    openGraph: {
        ...baseMetadata.openGraph,
        title,
        description
    }
}
