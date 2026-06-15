export type ProfileTab = "classic" | "pantheon" | "history" | "teammates" | "finder"

const RESERVED_TOP_LEVEL_SEGMENTS = new Set([
    "account",
    "admin",
    "analytics",
    "auth",
    "clan",
    "clans",
    "faq",
    "leaderboards",
    "multi",
    "pgcr",
    "privacy",
    "profile",
    "terms",
    "user"
])

type SessionWithProfile = {
    primaryDestinyMembershipId?: string
    user?: {
        profiles?: {
            vanity: string | null
            destinyMembershipId: string
        }[]
    }
}

export function isProfilePath(pathname: string): boolean {
    if (pathname.startsWith("/profile/")) {
        return true
    }

    if (pathname.startsWith("/user/")) {
        return true
    }

    const match = pathname.match(/^\/([^/]+)$/)
    if (!match?.[1]) {
        return false
    }

    return !RESERVED_TOP_LEVEL_SEGMENTS.has(match[1].toLowerCase())
}

export function getMyProfileHref(session: SessionWithProfile | null | undefined): string | null {
    const primaryProfile = session?.user?.profiles?.find(
        profile => profile.destinyMembershipId === session.primaryDestinyMembershipId
    )

    if (!primaryProfile) {
        return null
    }

    return primaryProfile.vanity
        ? `/${primaryProfile.vanity}`
        : `/profile/${primaryProfile.destinyMembershipId}`
}

export function profileTabHref(basePath: string, tab: ProfileTab): string {
    const [path, query = ""] = basePath.split("?")
    const params = new URLSearchParams(query)
    params.set("tab", tab)
    const queryString = params.toString()
    return queryString ? `${path}?${queryString}` : `${path}?tab=${tab}`
}

export function shouldIgnoreKeyboardShortcut(event: KeyboardEvent): boolean {
    const target = event.target
    if (!(target instanceof HTMLElement)) {
        return false
    }

    if (target.isContentEditable) {
        return true
    }

    const tag = target.tagName
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
}

export const KEYBOARD_SHORTCUTS = [
    { label: "Search", keys: ["mod", "K"] },
    { label: "Home", keys: ["mod", "shift", "H"] },
    { label: "My profile", keys: ["mod", "shift", "M"] },
    { label: "Teammates", keys: ["mod", "shift", "T"] },
    { label: "Instance Finder", keys: ["mod", "shift", "I"] },
    { label: "Keyboard shortcuts", keys: ["mod", "/"] }
] as const
