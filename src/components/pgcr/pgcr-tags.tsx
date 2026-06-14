"use client"

import { usePGCRTags } from "~/hooks/pgcr/usePGCRTags"
import { Badge } from "~/shad/badge"

export const PGCRTags = () => {
    const tags = usePGCRTags()

    return (
        !!tags.length && (
            <div className="flex gap-1 md:gap-2">
                {tags.map(({ tag, placement, key }) => (
                    <Badge
                        key={key}
                        variant="secondary"
                        className="bg-raidhub/90 text-sm text-gray-200">
                        {tag}
                        {placement != null && (
                            <span className="text text-foreground text-sm font-medium">{` #${placement}`}</span>
                        )}
                    </Badge>
                ))}
            </div>
        )
    )
}
