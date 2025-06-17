import { Card } from "~/shad/card"

export const StatCard = ({
    icon,
    label,
    value
}: {
    icon?: React.ReactNode
    label: string
    value: string
}) => (
    <Card className="flex items-center gap-3 border-zinc-800 bg-zinc-900 p-3">
        {icon && <div className="flex h-8 w-8 items-center justify-center">{icon}</div>}
        <div className="text-left">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    </Card>
)
