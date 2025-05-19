import { AlertCircle, CheckCircle2, Clock, ShieldQuestion } from "lucide-react"
import { Badge } from "~/shad/badge"

interface StatusBadgeProps {
    status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
    switch (status) {
        case "PENDING":
            return (
                <Badge
                    variant="outline"
                    className="rounded-sm border-yellow-400/30 bg-yellow-900/20 text-yellow-400">
                    <Clock className="mr-1 h-3 w-3" /> Pending
                </Badge>
            )
        case "IN_PROGRESS":
            return (
                <Badge
                    variant="outline"
                    className="rounded-sm border-blue-400/30 bg-blue-900/20 text-blue-400">
                    <ShieldQuestion className="mr-1 h-3 w-3" /> In Progress
                </Badge>
            )
        case "RESOLVED":
            return (
                <Badge
                    variant="outline"
                    className="rounded-sm border-green-400/30 bg-green-900/20 text-green-400">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Resolved
                </Badge>
            )
        case "REJECTED":
            return (
                <Badge
                    variant="outline"
                    className="rounded-sm border-red-400/30 bg-red-900/20 text-red-400">
                    <AlertCircle className="mr-1 h-3 w-3" /> Rejected
                </Badge>
            )
        default:
            return (
                <Badge variant="outline" className="rounded-sm">
                    {status}
                </Badge>
            )
    }
}
