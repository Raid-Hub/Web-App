"use client"

import { type ReactNode } from "react"
import { CloudflareImage, type CloudflareImageId } from "~/components/CloudflareImage"
import { CardTitle } from "~/components/__deprecated__/typography/CardTitle"
import { Card, CardContent, CardHeader } from "~/shad/card"

export const HomeCardGeneric = (props: {
    title: string
    backgroundImageCloudflareId: CloudflareImageId
    backgroundImageAltText: string
    children: ReactNode
}) => (
    <Card>
        <CardHeader className="relative p-0 md:p-0">
            <CloudflareImage
                priority
                width={640}
                height={360}
                cloudflareId={props.backgroundImageCloudflareId}
                alt={props.backgroundImageAltText}
            />
            <CardTitle className="absolute bottom-4 left-4">{props.title}</CardTitle>
        </CardHeader>
        <CardContent>{props.children}</CardContent>
    </Card>
)
