import { type Metadata } from "next"
import { baseMetadata } from "~/lib/metadata"

export const generatePlayerMetadata = ({
    displayName,
    username,
    image,
    vanity,
    destinyMembershipId
}: {
    displayName: string
    username: string
    image: string
    vanity: string | null
    destinyMembershipId: string
}): Metadata => {
    const description = `View ${username}'s raid stats, achievements, tags, and more`
    return {
        title: displayName,
        description,
        keywords: [
            ...baseMetadata.keywords,
            "raid report",
            "profile",
            "raid history",
            displayName,
            username
        ],
        openGraph: {
            ...baseMetadata.openGraph,
            type: "profile",
            username,
            title: displayName,
            description,
            images: {
                url: image
            }
        },
        robots: {
            follow: true,
            index: true
        },
        alternates: {
            canonical: vanity ? `/${vanity.toLowerCase()}` : `/profile/${destinyMembershipId}`
        }
    }
}
