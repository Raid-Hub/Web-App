"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"
import { useSession } from "~/hooks/app/useSession"

export function SentryUserSync() {
    const session = useSession()

    useEffect(() => {
        if (session.status === "authenticated") {
            Sentry.setUser({ id: session.data.user.id })
            if (session.data.primaryDestinyMembershipId) {
                Sentry.setTag("primary_membership_id", session.data.primaryDestinyMembershipId)
            }
            return
        }

        Sentry.setUser(null)
        Sentry.setTag("primary_membership_id", undefined)
    }, [session])

    return null
}
