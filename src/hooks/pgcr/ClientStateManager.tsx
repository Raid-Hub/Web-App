"use client"

import { Collection } from "@discordjs/collection"
import { useQueryClient } from "@tanstack/react-query"
import { type DestinyInventoryItemDefinition } from "bungie-net-core/models"
import { useLiveQuery } from "dexie-react-hooks"
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction
} from "react"
import { z } from "zod"
import { useQueryParams, type RaidHubQueryParams } from "~/hooks/util/useQueryParams"
import { type PGCRPageParams, type PlayerStats } from "~/lib/pgcr/types"
import { type RaidHubInstanceExtended, type RaidHubPlayerInfo } from "~/services/raidhub/types"
import { useDexie } from "~/util/dexie/dexie"

interface ClientStateManagerProps {
    data: RaidHubInstanceExtended
    mvp: string | null
    playerStatsMerged: Array<[string, PlayerStats]>
    scores: Array<
        [
            string,
            {
                completed: boolean
                score: number
            }
        ]
    >
    children: ReactNode
}

interface PGCRState {
    data: RaidHubInstanceExtended
    playerStatsMerged: Collection<string, PlayerStats>
    mvp: string | null
    scores: Collection<
        string,
        {
            completed: boolean
            score: number
        }
    >
    weaponsMap: Collection<number, DestinyInventoryItemDefinition>
    isReportModalOpen: boolean
    setIsReportModalOpen: Dispatch<SetStateAction<boolean>>
    query: RaidHubQueryParams<PGCRPageParams>
}

const PGCRContext = createContext<PGCRState | undefined>(undefined)

export const usePGCRContext = () => {
    const ctx = useContext(PGCRContext)
    if (!ctx) throw new Error("usePGCRContext must be used within a PGCRContextProvider")

    return ctx
}

export const ClientStateManager = ({
    data,
    playerStatsMerged,
    mvp,
    scores,
    children
}: ClientStateManagerProps) => {
    const queryClient = useQueryClient()

    useEffect(() => {
        data.players.forEach(entry => {
            queryClient.setQueryData<RaidHubPlayerInfo>(
                ["raidhub", "player", "basic", entry.playerInfo.membershipId],
                old => old ?? entry.playerInfo
            )
        })
    }, [queryClient, data])

    const dexie = useDexie()
    const weapons = useLiveQuery(() =>
        dexie.items.bulkGet(
            data.players.flatMap(p => p.characters.flatMap(c => c.weapons.map(w => w.weaponHash)))
        )
    )
    const weaponsMap = new Collection(
        weapons?.filter((w): w is DestinyInventoryItemDefinition => !!w).map(w => [w.hash, w])
    )

    const [isReportModalOpen, setIsReportModalOpen] = useState(false)

    const query = useQueryParams<PGCRPageParams>(
        z.object({
            player: z
                .string()
                .regex(/^\d{19}$/)
                .optional(),
            character: z
                .string()
                .regex(/^\d{19}$/)
                .optional()
        })
    )

    return (
        <PGCRContext.Provider
            value={{
                data,
                mvp,
                playerStatsMerged: new Collection(playerStatsMerged),
                weaponsMap,
                scores: new Collection(scores),
                isReportModalOpen,
                setIsReportModalOpen,
                query
            }}>
            {children}
        </PGCRContext.Provider>
    )
}
