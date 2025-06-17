import { CloudflareIcon } from "~/components/CloudflareImage"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shad/tooltip"

export function ProfileBadge(badge: {
    id: string
    name: string
    icon: string
    description: string
    size: number
}) {
    return (
        <Tooltip>
            <TooltipTrigger>
                <CloudflareIcon path={badge.icon} alt={badge.name} fill objectFit="contain" />
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p>
                    <b>{badge.name}</b>
                    <br />
                    {badge.description}
                </p>
            </TooltipContent>
        </Tooltip>
    )
}
