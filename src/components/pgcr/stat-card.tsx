import { cn } from "~/lib/tw"
import { Card } from "~/shad/card"

export const StatCard = ({
    icon,
    label,
    value,
    detail,
    className
}: {
    icon?: React.ReactNode
    label: string
    value: string
    detail?: string
    className?: string
}) => (
    <Card
        className={cn(
            "flex min-h-[4.5rem] items-center gap-3 border-zinc-800 bg-zinc-900/80 p-3",
            className
        )}>
        {icon && <div className="flex size-8 shrink-0 items-center justify-center">{icon}</div>}
        <div className="min-w-0 text-left">
            <p className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                {label}
            </p>
            <p className="text-lg font-semibold text-white tabular-nums">{value}</p>
            {detail && <p className="text-[10px] text-zinc-500 tabular-nums">{detail}</p>}
        </div>
    </Card>
)
