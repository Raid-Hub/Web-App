import { type Metadata } from "next"
import { type ReactNode } from "react"
import { baseMetadata } from "~/lib/metadata"

export default function Layout(params: { children: ReactNode }) {
    return <>{params.children}</>
}

export const metadata: Metadata = {
    title: "Raid Rotator Calendar",
    openGraph: {
        ...baseMetadata.openGraph,
        title: "Raid Rotator Calendar"
    }
}
