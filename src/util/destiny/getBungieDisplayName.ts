export function getBungieDisplayName(
    user: {
        membershipId: string
        displayName?: string | null
        bungieGlobalDisplayName?: string | null
        bungieGlobalDisplayNameCode?: string | number | null
    },
    opts?: { excludeCode: boolean }
) {
    if (user.bungieGlobalDisplayName && user.bungieGlobalDisplayNameCode) {
        return `${user.bungieGlobalDisplayName}${
            !opts?.excludeCode
                ? `#${String(user.bungieGlobalDisplayNameCode).padStart(4, "0")}`
                : ""
        }`
    } else {
        // Could be empty string, so we can't use nullish coalescing
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return user.displayName || user.membershipId
    }
}
