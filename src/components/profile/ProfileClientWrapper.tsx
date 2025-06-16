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
        if (vanity && pathname.startsWith("/profile")) {
            window.history.replaceState(
                {
                    vanity
                },
                "",
                `/${vanity}`
            )
        }
    }, [vanity, pathname])

    return (
        <PageWrapper pageProps={pageProps}>
            <ProfileStateManager>{children}</ProfileStateManager>
        </PageWrapper>
    )
}
