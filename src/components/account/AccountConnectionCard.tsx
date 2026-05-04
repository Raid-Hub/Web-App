"use client"

import type { ReactNode } from "react"
import { type SVGComponent } from "~/components/SVG"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { cn } from "~/lib/tw"

type AccountConnectionCardProps = {
    serviceName: string
    username: string | null
    link: () => void
    unlink: () => void
    Icon: SVGComponent
    footer?: ReactNode
}

export function AccountConnectionCard({
    serviceName,
    username,
    link,
    unlink,
    Icon,
    footer
}: AccountConnectionCardProps) {
    const linked = Boolean(username)

    return (
        <Card className={cn("rounded-xl border-border/60 shadow-sm")}>
            <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <div
                    className="bg-muted/50 flex size-11 shrink-0 items-center justify-center rounded-lg border border-border/50">
                    <Icon sx={22} className="text-foreground size-6" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    <CardTitle className="text-base">{serviceName}</CardTitle>
                    <CardDescription className="truncate">
                        {linked ? (
                            <>
                                Linked as <span className="text-foreground font-medium">{username}</span>
                            </>
                        ) : (
                            "Not connected"
                        )}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="default" size="sm" disabled={linked} onClick={link}>
                        Connect
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={!linked} onClick={unlink}>
                        Disconnect
                    </Button>
                </div>
                {footer}
            </CardContent>
        </Card>
    )
}
