"use client"

import { useRaidHubManifest } from "~/app/layout/managers"
import { HomeCardGeneric } from "./HomeCardGeneric"
import { HomeCardContentSection } from "./content/HomeCardContentSection"
import { HomeCardContentSectionItem } from "./content/HomeCardContentSectionItem"

export function HomeCardPantheon() {
    const { leaderboards } = useRaidHubManifest()
    return (
        <HomeCardGeneric
            id="Pantheon"
            title="Pantheon"
            backgroundImageCloudflareId="pantheonSplash"
            backgroundImageAltText="The Pantheon">
            <HomeCardContentSection sectionTitle="First Completions">
                {leaderboards.pantheon.first.map(board => (
                    <HomeCardContentSectionItem
                        key={board.versionId}
                        title={board.displayName}
                        href={`/leaderboards/pantheon/${board.path}/first`}
                    />
                ))}
            </HomeCardContentSection>
            <HomeCardContentSection sectionTitle="High Score">
                {leaderboards.pantheon.first.map(board => (
                    <HomeCardContentSectionItem
                        key={board.versionId}
                        title={board.displayName}
                        href={`/leaderboards/pantheon/${board.path}/score`}
                    />
                ))}
            </HomeCardContentSection>
            <HomeCardContentSection sectionTitle="Speedrun">
                {leaderboards.pantheon.speedrun.map(board => (
                    <HomeCardContentSectionItem
                        key={board.versionId}
                        title={board.displayName}
                        href={`/leaderboards/pantheon/${board.path}/speedrun`}
                    />
                ))}
            </HomeCardContentSection>
            <HomeCardContentSection sectionTitle="Individual Leaderboards">
                {leaderboards.pantheon.individual.map(board => (
                    <HomeCardContentSectionItem
                        key={board.category}
                        title={board.displayName}
                        href={`/leaderboards/pantheon/all/${board.category}`}
                    />
                ))}
            </HomeCardContentSection>
        </HomeCardGeneric>
    )
}