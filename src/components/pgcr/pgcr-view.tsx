import { Collection } from "@discordjs/collection"
import { ClientStateManager } from "~/hooks/pgcr/ClientStateManager"
import { generateSortScore } from "~/lib/pgcr/riis"
import { type RaidHubInstanceExtended } from "~/services/raidhub/types"
import { Card } from "~/shad/card"
import { Separator } from "~/shad/separator"
import { PGCRHeader } from "./pgcr-header"
import { PGCRPlayers } from "./pgcr-players"
import { PlayerDetailsPanelWrapper } from "./player-details-panel"

interface PGCRProps {
    data: RaidHubInstanceExtended
}

export default function PGCR({ data }: PGCRProps) {
    const sortScores = new Collection(
        data.players.map(p => [
            p.playerInfo.membershipId,
            {
                completed: p.completed,
                score: generateSortScore(p)
            }
        ])
    ).toSorted((a, b) => {
        if (a.completed === b.completed) {
            return b.score - a.score
        } else {
            return a.completed ? -1 : 1
        }
    })

    const playerMergedStats = new Collection(
        data.players.map(
            player =>
                [
                    player.playerInfo.membershipId,
                    player.characters.reduce(
                        (acc, character) => ({
                            kills: acc.kills + character.kills,
                            deaths: acc.deaths + character.deaths,
                            assists: acc.assists + character.assists,
                            precisionKills: acc.precisionKills + character.precisionKills,
                            superKills: acc.superKills + character.superKills,
                            meleeKills: acc.meleeKills + character.meleeKills,
                            grenadeKills: acc.grenadeKills + character.grenadeKills,
                            timePlayedSeconds: acc.timePlayedSeconds + character.timePlayedSeconds
                        }),
                        {
                            kills: 0,
                            deaths: 0,
                            assists: 0,
                            precisionKills: 0,
                            superKills: 0,
                            meleeKills: 0,
                            grenadeKills: 0,
                            timePlayedSeconds: 0
                        }
                    )
                ] as const
        )
    )

    const mvp = data.completed && data.playerCount > 2 ? sortScores.firstKey()! : null

    return (
        <ClientStateManager
            data={data}
            mvp={mvp}
            scores={Array.from(sortScores.entries())}
            playerStatsMerged={Array.from(playerMergedStats.entries())}>
            <div className="container mx-auto my-auto w-full max-w-5xl">
                <Card className="w-full gap-0 overflow-hidden border border-zinc-800 bg-zinc-950 py-0 shadow-md md:w-[768px] lg:w-[956px] xl:w-[1096px]">
                    <PGCRHeader data={data} />

                    <Separator className="bg-zinc-800" />

                    <PGCRPlayers
                        data={data}
                        playerMergedStats={playerMergedStats}
                        sortScores={sortScores}
                        mvp={mvp}
                    />
                </Card>

                {/*  Player Details Panel */}
                <PlayerDetailsPanelWrapper />
            </div>
        </ClientStateManager>
    )
}
