"use client"

import { Grid } from "~/components/layout/Grid"
import { useRaidHubManifest } from "~/components/providers/RaidHubManifestManager"
import { HomeCardPantheon } from "./cards/HomeCardPantheon"
import { HomeCardRaid } from "./cards/HomeCardRaid"

export const Cards = () => {
    const { listedRaids } = useRaidHubManifest()

    return (
        <Grid $minCardWidth={320} $gap={1.5}>
            {listedRaids.map(raidId => (
                <HomeCardRaid key={raidId} raidId={raidId} />
            ))}
            <HomeCardPantheon />
        </Grid>
    )
}
