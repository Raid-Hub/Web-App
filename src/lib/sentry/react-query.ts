/**
 * React Query ↔ Sentry integration.
 *
 * Optional Bungie probes (manifest download, status banner, live profile cards) surface
 * failures in UI overlays — not actionable as Sentry errors. Register query keys here
 * instead of sprinkling `meta.sentryCapture` on each hook.
 */
export const sentryOptionalQueryMeta = { sentryCapture: false as const }

/** Prefix match on queryKey — first N segments must equal. */
export const OPTIONAL_BUNGIE_QUERY_PREFIXES: readonly (readonly string[])[] = [
    ["bungie", "manifest"],
    ["bungie", "platform-settings"],
    ["bungie", "global-alerts"],
    ["bungie", "profile", "live data"],
    ["bungie", "profile", "transitory"]
]

export function isOptionalBungieQueryKey(queryKey: unknown): boolean {
    if (!Array.isArray(queryKey)) {
        return false
    }

    return OPTIONAL_BUNGIE_QUERY_PREFIXES.some(prefix =>
        prefix.every((segment, index) => queryKey[index] === segment)
    )
}
