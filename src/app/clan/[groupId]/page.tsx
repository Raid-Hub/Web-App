import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { ClanComponent } from "~/components/__deprecated__/clan/Clan"
import { PageWrapper } from "~/components/PageWrapper"
import { baseMetadata } from "~/lib/metadata"
import { fixClanName } from "~/util/destiny/fixClanName"
import { isValidClanGroupId } from "~/util/destiny/routeParams"
import { getClan, type PageProps } from "../server"

export const revalidate = 0

export default async function Page({ params }: PageProps) {
    if (!isValidClanGroupId(params.groupId)) {
        notFound()
    }

    const clan = await getClan(params.groupId)
    if (!clan) {
        notFound()
    }

    return (
        <PageWrapper>
            <ClanComponent clan={clan} groupId={params.groupId} />
        </PageWrapper>
    )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    if (!isValidClanGroupId(params.groupId)) {
        return {}
    }

    const clan = await getClan(params.groupId)

    if (!clan) return {}

    const clanName = fixClanName(clan.detail.name)

    const inheritedOpengraph = structuredClone(baseMetadata.openGraph)
    // Remove images from inherited metadata, otherwise it overrides the image generated
    // by the dynamic image generator
    delete inheritedOpengraph.images

    return {
        title: clanName,
        description: clan.detail.motto,
        keywords: [...baseMetadata.keywords, "clan", clanName],
        openGraph: {
            ...inheritedOpengraph,
            title: clanName,
            description: clan.detail.motto
        }
    }
}
