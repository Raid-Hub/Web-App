import { cn } from "~/lib/tw"

interface ReportPanelItemBoxProps {
    title: string
    description?: string
    className?: string
    children?: React.ReactNode
}

export const ReportPanelItemBox = ({
    title,
    description,
    className,
    children
}: ReportPanelItemBoxProps) => {
    return (
        <div className={cn("flex-1 rounded-sm border border-white/10 bg-black/40 p-4", className)}>
            <h3 className="mb-2 text-base font-medium">{title}</h3>
            {description && <p className="mb-4 text-sm text-white/60">{description}</p>}
            {children}
        </div>
    )
}
