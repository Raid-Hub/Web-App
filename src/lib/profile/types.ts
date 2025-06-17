import { type RaidHubPlayerInfo, type RaidHubPlayerProfileResponse } from "~/services/raidhub/types"
import type { AppProfile } from "~/types/api"

export type ProfileProps = {
    destinyMembershipId: string
    destinyMembershipType: number
    ssrAppProfile: AppProfile | null
    ssrRaidHubBasic?: RaidHubPlayerInfo | null
    ssrRaidHubProfile?: RaidHubPlayerProfileResponse | null
    ready: boolean
}
