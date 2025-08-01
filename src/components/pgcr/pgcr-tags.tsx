"use client"

import { usePGCRTags } from "~/hooks/pgcr/usePGCRTags"
import { Badge } from "~/shad/badge"

export const PGCRTags = () => {
    const tags = usePGCRTags()

    return (
        !!tags.length && (
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
    )
}
