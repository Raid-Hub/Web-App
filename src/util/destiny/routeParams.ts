/** Bungie destiny membership IDs are 19-digit decimal strings. */
const DESTINY_MEMBERSHIP_ID_PATTERN = /^\d{19}$/

/** Clan group IDs are numeric Bungie identifiers. */
const CLAN_GROUP_ID_PATTERN = /^\d{1,12}$/

/** PGCR instance IDs are numeric. */
const INSTANCE_ID_PATTERN = /^\d{1,20}$/

export function isValidDestinyMembershipId(id: string): boolean {
    return DESTINY_MEMBERSHIP_ID_PATTERN.test(id)
}

export function isValidClanGroupId(id: string): boolean {
    return CLAN_GROUP_ID_PATTERN.test(id)
}

export function isValidInstanceId(id: string): boolean {
    return INSTANCE_ID_PATTERN.test(id)
}
