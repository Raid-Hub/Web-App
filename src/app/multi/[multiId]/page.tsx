import type { Metadata } from "next"

import { PageWrapper } from "~/components/PageWrapper"
import { MultiLoader } from "~/components/multi/multi-loader"
import { baseMetadata } from "~/lib/metadata"
import { trpcServer } from "~/lib/server/trpc/rpc"
import { reactRequestDedupe } from "~/util/react-cache"

export const revalidate = 300

const prefetchMultiPGCR = reactRequestDedupe(async (multiId: string) => {
    return await trpcServer.multi.get.query({ id: multiId })
})

interface PageProps {
    params: {
        multiId: string
    }
}

export default async function Page({ params }: PageProps) {
    const multi = await prefetchMultiPGCR(params.multiId)

    return (
        <PageWrapper>
            <MultiLoader
                instances={multi.instances.map(instance => instance.instanceId)}
                name={multi.name}
            />
        </PageWrapper>
    )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const multi = await prefetchMultiPGCR(params.multiId)

    return {
        title: multi.name,
        keywords: [...baseMetadata.keywords, "pgcr", "multi"],
        openGraph: {
            ...baseMetadata.openGraph,
            title: multi.name
        },
        robots: {
            follow: true,
            index: false
        }
    }
}
