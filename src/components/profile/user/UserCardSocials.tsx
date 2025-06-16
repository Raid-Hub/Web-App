"use client"

import Link from "next/link"
import { OptionalWrapper } from "~/components/OptionalWrapper"
import { useSocialConnections } from "~/hooks/profile/useSocialConnections"

export const UserCardSocials = () => {
    const socials = useSocialConnections() ?? []

    return (
        !!socials?.length && (
            <div className="bg-dark w-min rounded-lg p-2 opacity-60">
                <div className="jsustify-between flex items-center gap-2">
                    {socials.map(({ Icon, id, displayName, url }) => (
                        <OptionalWrapper
                            key={id}
                            condition={url}
                            wrapper={({ children, value }) => (
                                <Link href={value} className="h-full">
                                    {children}
                                </Link>
                            )}>
                            <div className="flex items-center gap-2">
                                <Icon className="size-6" />
                                {displayName}
                            </div>
                        </OptionalWrapper>
                    ))}
                </div>
            </div>
        )
    )
}
