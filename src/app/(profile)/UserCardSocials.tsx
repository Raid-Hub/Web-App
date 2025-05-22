"use client"

import Link from "next/link"
import { Fragment } from "react"
import { Card } from "~/components/Card"
import { Flex } from "~/components/layout/Flex"
import { useSocialConnections } from "./useSocialConnections"

export const UserCardSocials = () => {
    const socials = useSocialConnections() ?? []

    return (
        !!socials?.length && (
            <Card $borderRadius={6} $opacity={60} $color="dark" style={{ width: "min-content" }}>
                <Flex $paddingY={0.5} $paddingX={1.2} $align="space-between" $gap={2}>
                    {socials.map(({ Icon, id, displayName, url }) => (
                        <Fragment key={id}>
                            {url ? (
                                <Link href={url} style={{ height: "100%", color: "unset" }}>
                                    <Flex $padding={0} $gap={0.7}>
                                        <Icon color="white" sx={24} />
                                        {displayName}
                                    </Flex>
                                </Link>
                            ) : (
                                <Flex $padding={0} $gap={0.7}>
                                    <Icon color="white" sx={24} />
                                    {displayName}
                                </Flex>
                            )}
                        </Fragment>
                    ))}
                </Flex>
            </Card>
        )
    )
}
