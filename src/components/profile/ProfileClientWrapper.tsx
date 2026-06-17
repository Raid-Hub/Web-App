"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { PageWrapper } from "~/components/PageWrapper"
import { type ProfileProps } from "~/lib/profile/types"
import { ProfileStateManager } from "./ProfileStateManager"

export function ProfileClientWrapper({
    children,
    pageProps
}: { children: ReactNode } & { pageProps: ProfileProps }) {
    const pathname = usePathname()
    const vanity = pageProps.ssrAppProfile?.vanity
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted || !vanity || !pathname.startsWith("/profile")) {
            return
        }

        const targetPath = `/${vanity}`
        if (window.location.pathname === targetPath) {
            return
        }

        // Defer until after RSC hydration — immediate replaceState races Next flight scripts ($RC).
        const frameId = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (window.location.pathname !== targetPath) {
                    window.history.replaceState(
                        { vanity },
                        "",
                        `${targetPath}${window.location.search}${window.location.hash}`
                    )
                }
            })
        })

        return () => cancelAnimationFrame(frameId)
    }, [mounted, vanity, pathname])

    return (
        <PageWrapper pageProps={pageProps}>
            <ProfileStateManager>{children}</ProfileStateManager>
        </PageWrapper>
    )
}
