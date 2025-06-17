"use client"

import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { getRaidSplash } from "~/lib/activity-images"
import { SpeedrunVariables } from "~/lib/speedrun/speedrun-com-mappings"
import { o } from "~/util/o"
import { HomeCardGeneric } from "./HomeCardGeneric"
import { HomeCardContentSection } from "./content/HomeCardContentSection"
import { HomeCardContentSectionItem } from "./content/HomeCardContentSectionItem"

const raidHubBoards = [
    ["Clears", "clears"],
    ["Full Clears", "freshClears"],
    ["Sherpas", "sherpas"]
]

export const HomeCardRaid = ({ raidId }: { raidId: number }) => {
    const { reprisedRaids, getVersionsForActivity, getActivityString, getUrlPathForActivity } =
        useRaidHubManifest()

    const raidUrlPath = getUrlPathForActivity(raidId)

    if (!raidUrlPath) return null

    const isReprised = reprisedRaids.includes(raidId)
    const miscBoards = getVersionsForActivity(raidId).filter(
        v => v.id !== 32 && (isReprised ? !v.isChallengeMode && v.id > 2 : v.id > 2)
    )

    return (
        <HomeCardGeneric
            title={getActivityString(raidId)}
            backgroundImageCloudflareId={getRaidSplash(raidId) ?? "pantheonSplash"}
            backgroundImageAltText={`Splash for ${getActivityString(raidId)}`}>
            <HomeCardContentSection sectionTitle="World First Race">
                <HomeCardContentSectionItem
                    title={isReprised ? "Challenge" : "Normal"}
                    href={`/leaderboards/team/${raidUrlPath}/worldfirst`}
                />
                {isReprised && (
                    <HomeCardContentSectionItem
                        title="Normal"
                        href={`/leaderboards/team/${raidUrlPath}/first/normal`}
                    />
                )}
            </HomeCardContentSection>
            {!!miscBoards.length && (
                <HomeCardContentSection sectionTitle="Version Firsts">
                    {miscBoards.map(version => (
                        <HomeCardContentSectionItem
                            key={version.id}
                            title={version.name}
                            href={`/leaderboards/team/${raidUrlPath}/first/${version.path}`}
                        />
                    ))}
                </HomeCardContentSection>
            )}
            <HomeCardContentSection sectionTitle="Speedrun Leaderboards">
                {SpeedrunVariables[raidUrlPath]?.variable ? (
                    o.map(
                        SpeedrunVariables[raidUrlPath].variable!.values,
                        (type, data) =>
                            data && (
                                <HomeCardContentSectionItem
                                    key={data.id}
                                    title={data.displayName}
                                    href={`/leaderboards/team/${raidUrlPath}/speedrun/${type}`}
                                />
                            )
                    )
                ) : (
                    <HomeCardContentSectionItem
                        title="Any %"
                        href={`/leaderboards/team/${raidUrlPath}/speedrun/all`}
                    />
                )}
            </HomeCardContentSection>
            <HomeCardContentSection sectionTitle="Individual Leaderboards">
                {raidHubBoards.map(([displayName, path]) => (
                    <HomeCardContentSectionItem
                        key={displayName}
                        title={displayName}
                        href={`/leaderboards/individual/${raidUrlPath}/${path}`}
                    />
                ))}
            </HomeCardContentSection>
        </HomeCardGeneric>
    )
}
