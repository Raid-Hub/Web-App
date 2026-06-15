"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useSession } from "~/hooks/app/useSession"
import {
    getMyProfileHref,
    isProfilePath,
    profileTabHref,
    shouldIgnoreKeyboardShortcut,
    type ProfileTab
} from "~/lib/navigation/shortcuts"
import { ShortcutsDialog } from "./ShortcutsDialog"

export function GlobalHotkeys() {
    const router = useRouter()
    const pathname = usePathname()
    const { data: session } = useSession()
    const [shortcutsOpen, setShortcutsOpen] = useState(false)

    const navigateToProfileTab = useCallback(
        (tab: ProfileTab) => {
            if (isProfilePath(pathname)) {
                const params = new URLSearchParams(window.location.search)
                params.set("tab", tab)
                router.push(`${pathname}?${params.toString()}`)
                return
            }

            const profileHref = getMyProfileHref(session)
            if (!profileHref) {
                return
            }

            router.push(profileTabHref(profileHref, tab))
        },
        [pathname, router, session]
    )

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (shouldIgnoreKeyboardShortcut(event)) {
                return
            }

            const mod = event.metaKey || event.ctrlKey
            if (!mod) {
                return
            }

            if (event.key === "/" && !event.shiftKey) {
                event.preventDefault()
                setShortcutsOpen(open => !open)
                return
            }

            if (!event.shiftKey || event.altKey) {
                return
            }

            switch (event.key.toLowerCase()) {
                case "h":
                    event.preventDefault()
                    router.push("/")
                    break
                case "m": {
                    event.preventDefault()
                    const profileHref = getMyProfileHref(session)
                    if (profileHref) {
                        router.push(profileHref)
                    }
                    break
                }
                case "t":
                    event.preventDefault()
                    navigateToProfileTab("teammates")
                    break
                case "i":
                    event.preventDefault()
                    navigateToProfileTab("finder")
                    break
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [navigateToProfileTab, router, session])

    return <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
}
