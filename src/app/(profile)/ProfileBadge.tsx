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
        <>
            <TooltipContainer
                $bottom
                tooltipId={badge.id}
                tooltipBody={
                    <TooltipData $mt={0.5}>
                        <p>
                            <b>{badge.name}</b>
                            <br />
                            {badge.description}
                        </p>
                    </TooltipData>
                }>
                <CloudflareIcon
                    path={badge.icon}
                    alt={badge.name}
                    width={badge.size}
                    height={badge.size}
                />
            </TooltipContainer>
            <TooltipContainer
                $bottom
                tooltipId={badge.id}
                tooltipBody={
                    <TooltipData $mt={0.5}>
                        <p>
                            <b>{badge.name}</b>
                            <br />
                            {badge.description}
                        </p>
                    </TooltipData>
                }>
                <CloudflareIcon
                    path={badge.icon}
                    alt={badge.name}
                    width={badge.size}
                    height={badge.size}
                />
            </TooltipContainer>
            <TooltipContainer
                $bottom
                tooltipId={badge.id}
                tooltipBody={
                    <TooltipData $mt={0.5}>
                        <p>
                            <b>{badge.name}</b>
                            <br />
                            {badge.description}
                        </p>
                    </TooltipData>
                }>
                <CloudflareIcon
                    path={badge.icon}
                    alt={badge.name}
                    width={badge.size}
                    height={badge.size}
                />
            </TooltipContainer>
            <TooltipContainer
                $bottom
                tooltipId={badge.id}
                tooltipBody={
                    <TooltipData $mt={0.5}>
                        <p>
                            <b>{badge.name}</b>
                            <br />
                            {badge.description}
                        </p>
                    </TooltipData>
                }>
                <CloudflareIcon
                    path={badge.icon}
                    alt={badge.name}
                    width={badge.size}
                    height={badge.size}
                />
            </TooltipContainer>
            <TooltipContainer
                $bottom
                tooltipId={badge.id}
                tooltipBody={
                    <TooltipData $mt={0.5}>
                        <p>
                            <b>{badge.name}</b>
                            <br />
                            {badge.description}
                        </p>
                    </TooltipData>
                }>
                <CloudflareIcon
                    path={badge.icon}
                    alt={badge.name}
                    width={badge.size}
                    height={badge.size}
                />
            </TooltipContainer>
        </>
    )
}
