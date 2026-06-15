import { type RaidHubManifestResponse } from "~/services/raidhub/types"

export const tryGetRaidDefinition = (raid: string, manifest: RaidHubManifestResponse) => {
    return (
        Object.values(manifest.activityDefinitions).find(def => def.isRaid && def.path === raid) ??
        null
    )
}

export const getRaidDefinition = tryGetRaidDefinition
