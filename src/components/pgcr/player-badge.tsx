import { cn } from "~/lib/tw"
import { Badge } from "~/shad/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shad/tooltip"

const variants = {
    mvp: {
        title: "MVP",
        description: "Most Valuable Player",
        colors: {
            bg: "bg-yellow-500/10",
            text: "text-yellow-500",
            border: "border-yellow-500/20"
        }
    },
    sherpa: {
        title: "Sherpa",
        description: "Guided other players through this activity",
        colors: {
            bg: "bg-blue-500/10",
            text: "text-blue-500",
            border: "border-blue-500/20"
        }
    },
    firstClear: {
        title: "First Clear",
        description: "First time completing this activity",
        colors: {
            bg: "bg-green-500/10",
            text: "text-green-500",
            border: "border-green-500/20"
        }
    },
    dnf: {
        title: "DNF",
        description: "Did not finish the activity",
        colors: {
            bg: "bg-zinc-500/10",
            text: "text-zinc-500",
            border: "border-zinc-500/20"
        }
    }
}

interface PlayerBadgeProps {
    variant: keyof typeof variants
    titleOverride?: string
    className?: string
}
export const PlayerBadge = ({ variant, className, titleOverride }: PlayerBadgeProps) => {
    const { title, description, colors } = variants[variant]
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge
                    variant="outline"
                    className={cn(colors.bg, colors.text, colors.border, className)}>
                    {titleOverride ?? title}
                </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
                {description}
            </TooltipContent>
        </Tooltip>
    )
}
