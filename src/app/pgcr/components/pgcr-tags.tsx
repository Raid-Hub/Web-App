"use client"

import { Badge } from "~/components/ui/badge"
import { usePGCRTags } from "../hooks/usePGCRTags"

export const PGCRTags = () => {
    const tags = usePGCRTags()

    return (
        <div className="flex gap-1 md:gap-2">
            {tags.map(({ tag, placement }) => (
                <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-raidhub/90 text-sm text-gray-200">
                    {tag}
                    {placement && (
                        <span className="text text-foreground text-sm font-medium">{` #${placement}`}</span>
                    )}
                </Badge>
            ))}
        </div>
    )
}
