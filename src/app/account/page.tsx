import { type Metadata } from "next"
import { Suspense } from "react"
import { PageWrapper } from "~/components/layout/PageWrapper"
import { baseMetadata } from "~/lib/metadata"
import { getProviders } from "~/server/api/auth"
import { Client } from "./Client"

const providers = getProviders().map(p => ({
    id: p.id,
    name: p.name,
    type: p.type
}))

export default async function Page() {
    return (
        <PageWrapper>
            <Suspense>
                <Client providers={providers} />
            </Suspense>
        </PageWrapper>
    )
}

export const metadata: Metadata = {
    title: "Account",
    openGraph: {
        ...baseMetadata.openGraph,
        title: "Account"
    }
}
