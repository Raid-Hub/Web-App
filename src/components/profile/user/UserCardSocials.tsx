"use client"

import Link from "next/link"
import { OptionalWrapper } from "~/components/OptionalWrapper"
import { useSocialConnections } from "~/hooks/profile/useSocialConnections"

export const UserCardSocials = () => {
    const socials = useSocialConnections() ?? []

    return (
        !!socials?.length && (
            <div className="flex flex-wrap items-center gap-4">
                {socials.map(({ Icon, id, displayName, url }) => (
                    <OptionalWrapper
                        key={id}
                        condition={url}
                        wrapper={({ children, value }) => (
                            <Link href={value} className="h-full">
                                {children}
                            </Link>
                        )}>
                        <div className="text-secondary flex items-center gap-2">
                            <Icon className="size-6" />
                            {displayName}
                        </div>
                    </OptionalWrapper>
                ))}
            </div>
        )
    )
}
