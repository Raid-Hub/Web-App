import { CloudflareIcon } from "~/components/CloudflareImage"
import { TooltipContainer, TooltipData } from "~/components/Tooltip"

export function ProfileBadge(badge: {
    id: string
    name: string
    icon: string
    description: string
    size: number
}) {
    return (
        <TooltipContainer
            $bottom
            tooltipId={badge.id}
            tooltipBody={
                <TooltipData>
                    <p>
                        <b>{badge.name}</b>
                        <br />
                        {badge.description}
                    </p>
                </TooltipData>
            }>
            <div
                style={{
                    minWidth: badge.size,
                    position: "relative"
                }}>
                <CloudflareIcon path={badge.icon} alt={badge.name} fill objectFit="contain" />
            </div>
        </TooltipContainer>
    )
}
