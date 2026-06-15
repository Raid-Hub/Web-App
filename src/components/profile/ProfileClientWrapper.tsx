"use client"

import { usePathname } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { PageWrapper } from "~/components/PageWrapper"
import { type ProfileProps } from "~/lib/profile/types"
import { ProfileStateManager } from "./ProfileStateManager"

export function ProfileClientWrapper({
    children,
    pageProps
}: { children: ReactNode } & { pageProps: ProfileProps }) {
    const pathname = usePathname()
    const vanity = pageProps.ssrAppProfile?.vanity

    useEffect(() => {
        if (!vanity || !pathname.startsWith("/profile")) {
            return
        }

        const targetPath = `/${vanity}`
        if (window.location.pathname === targetPath) {
            return
        }

        window.history.replaceState(
            { vanity },
            "",
            `${targetPath}${window.location.search}${window.location.hash}`
        )
    }, [vanity, pathname])

    return (
        <PageWrapper pageProps={pageProps}>
            <ProfileStateManager>{children}</ProfileStateManager>
        </PageWrapper>
    )
}
