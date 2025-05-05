interface ActivityPieChartProps {
    percentage: number
    size?: number
    strokeWidth?: number
    color?: "green" | "orange" | "primary"
}

export function ActivityPieChart({
    percentage,
    size = 24,
    strokeWidth = 3,
    color = "primary"
}: ActivityPieChartProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    const getColorClass = () => {
        switch (color) {
            case "green":
                return "text-green-500"
            case "orange":
                return "text-amber-500"
            default:
                return "text-primary"
        }
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90 transform">
            {/* Background circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-zinc-800"
            />

            {/* Foreground circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={getColorClass()}
            />
        </svg>
    )
}
