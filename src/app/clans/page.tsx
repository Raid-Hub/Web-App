import { PageWrapper } from "~/components/PageWrapper"
import { baseMetadata } from "~/lib/metadata"
import { ClanLeaderboards } from "./ClanLeaderboards"

export const metadata = {
    title: "Clan Leaderboards",
    description: "View the top clans in Destiny 2 by a variety of metrics.",
    openGraph: {
        ...baseMetadata.openGraph,
        title: "Clan Leaderboards",
        description: "View the top clans in Destiny 2 by a variety of metrics."
    },
    keywords: [...baseMetadata.keywords, "clan", "rankings"]
}

export default function Page() {
    return (
        <PageWrapper>
            <h1>Clan Leaderboards</h1>
            <p>
                Clan leaderboards refresh once per week prior to reset on Monday. Clans with at
                least one player in the top 1000 of an individual leaderboard are included in the
                clan leaderboard.
            </p>
            <ClanLeaderboards />
        </PageWrapper>
    )
}
