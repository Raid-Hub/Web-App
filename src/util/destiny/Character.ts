import { Collection } from "@discordjs/collection"
import {
    BungieMembershipType,
    DestinyCharacterComponent,
    DestinyClass,
    DestinyHistoricalStatsValue,
    DestinyPlayer,
    DestinyPostGameCarnageReportEntry,
    DestinyPostGameCarnageReportExtendedData,
    UserInfoCard
} from "bungie-net-core/models"
import { CharacterLogos } from "~/images/icons/character-logos"
import { IPGCREntry, IPGCREntryStats, PlayerWeapons } from "../../types/pgcr"
import { pgcrEntryRankingScore } from "./pgcrEntryRankingScore"
import { parseWeapons } from "./weapons"

export default class DestinyPGCRCharacter implements IPGCREntry, DestinyPostGameCarnageReportEntry {
    readonly standing: number
    readonly score: DestinyHistoricalStatsValue
    readonly player: DestinyPlayer & Partial<DestinyCharacterComponent>
    readonly characterId: string
    readonly values: { [key: string]: DestinyHistoricalStatsValue }
    readonly extended: DestinyPostGameCarnageReportExtendedData
    readonly weapons: PlayerWeapons
    readonly stats: IPGCREntryStats

    constructor(data: DestinyPostGameCarnageReportEntry) {
        this.standing = data.standing
        this.characterId = data.characterId
        this.score = data.score
        this.player = data.player
        this.characterId = data.characterId
        this.values = data.values
        this.extended = data.extended
        this.weapons = this.extended.weapons
            ? parseWeapons(this.extended.weapons)
            : new Collection()

        const getStat = (key: string): number | undefined => this.values[key]?.basic.value
        const getExtendedStat = (
            key:
                | "precisionKills"
                | "weaponKillsAbility"
                | "weaponKillsGrenade"
                | "weaponKillsMelee"
                | "weaponKillsSuper"
        ): number | undefined => this.extended.values[key]?.basic.value

        const weaponKills = this.weapons.reduce((kills, weapon) => kills + weapon.kills, 0)
        const _stats = {
            kills: getStat("kills")!,
            deaths: getStat("deaths")!,
            assists: getStat("assists")!,
            weaponKills,
            abilityKills: getStat("kills")! - weaponKills,
            kdr: getStat("kills")! / (getStat("deaths") || 1),
            kda: getStat("kills")! + getStat("assists")! / (getStat("deaths") || 1),
            precisionKills: getExtendedStat("precisionKills")!,
            superKills: getExtendedStat("weaponKillsSuper")!,
            grenadeKills: getExtendedStat("weaponKillsGrenade")!,
            meleeKills: getExtendedStat("weaponKillsMelee")!,
            timePlayedSeconds: !!getStat("completed")!
                ? getStat("activityDurationSeconds")! - getStat("startSeconds")!
                : getStat("timePlayedSeconds")!
        }

        this.stats = {
            ..._stats,
            score: pgcrEntryRankingScore({ ..._stats, didComplete: this.didComplete })
        }
    }

    get displayName(): string {
        const info = this.player.destinyUserInfo
        return info.bungieGlobalDisplayName || info.displayName
    }

    get membershipId(): string {
        return this.player.destinyUserInfo.membershipId
    }

    get membershipType(): BungieMembershipType {
        return this.player.destinyUserInfo.membershipType
    }

    get didComplete(): boolean {
        return !!this.values.completed.basic.value && this.values.completionReason.basic.value === 0
    }

    get classType(): DestinyClass {
        switch (this.player.classHash) {
            case 3655393761:
                return 0 // DestinyClass.Titan
            case 671679327:
                return 1 // DestinyClass.Hunter
            case 2271682572:
                return 2 // DestinyClass.Warlock
            default:
                return 3 // DestinyClass.Unknown
        }
    }

    get logo() {
        return CharacterLogos[this.classType]
    }

    get banner(): number {
        return this.player.emblemHash
    }

    hydrate([userInfo, character]: [UserInfoCard, DestinyCharacterComponent | null]) {
        Object.assign(this, {
            ...this,
            player: {
                ...this.player,
                ...character,
                classType: character?.classType ?? 3,
                destinyUserInfo: {
                    ...this.player.bungieNetUserInfo,
                    ...userInfo
                }
            }
        })
    }
}