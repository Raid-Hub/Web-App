"use client"

import { usePGCRQueryParams } from "../../hooks/usePGCRQueryParams"
import { usePGCRContext } from "../ClientStateManager"
import { PlayerDetailsPanel } from "./player-details-panel"

export const PlayerDetailsPanelWrapper = () => {
    const { data } = usePGCRContext()
    const { validatedSearchParams, remove } = usePGCRQueryParams()
    const selectedPlayer = validatedSearchParams.get("player")
    const selectedPlayerData =
        data.players.find(player => player.playerInfo.membershipId === selectedPlayer) ??
        data.players[0]

    const exitPlayerPanel = () => {
        remove("character", undefined, { commit: false })
        remove("player", undefined, { commit: true, shallow: true })
    }

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 ${
                selectedPlayer ? "opacity-100" : "pointer-events-none opacity-0"
            } transition-opacity duration-200`}>
            <div className="relative h-full w-full max-w-4xl overflow-hidden rounded-lg border border-zinc-800 bg-black md:h-[80vh] md:max-h-[90vh]">
                <PlayerDetailsPanel player={selectedPlayerData} onClose={() => exitPlayerPanel()} />
            </div>
        </div>
    )
}
