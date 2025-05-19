import { Flag, User } from "lucide-react"
import { StatusBadge } from "~/components/reporting/status-badge"
import { cn } from "~/lib/tw"
import type { Report } from "~/lib/types"

interface ReportListProps {
    reports: Report[]
    selectedReport: number | null
    onSelectReport: (reportId: number) => void
}

export function ReportList({ reports, selectedReport, onSelectReport }: ReportListProps) {
    if (reports.length === 0) {
        return (
            <div className="py-8 text-center text-white/60">
                <p>No reports match your criteria</p>
            </div>
        )
    }

    return (
        <div className="max-h-[calc(100vh-280px)] space-y-2 overflow-y-auto pr-2">
            {reports.map(report => (
                <div
                    key={report.reportId}
                    className={cn(
                        "cursor-pointer rounded-sm border p-3 transition-colors",
                        selectedReport === report.reportId
                            ? "border-orange-500/50 bg-black/50"
                            : "border-white/10 bg-black/30 hover:border-white/20"
                    )}
                    onClick={() => onSelectReport(report.reportId)}>
                    <div className="mb-2 flex items-start justify-between">
                        <div className="font-medium">Instance #{report.instanceId}</div>
                        <StatusBadge status={report.status} />
                    </div>
                    <div className="mb-1 text-sm text-white/70">
                        <span className="inline-flex items-center">
                            <Flag className="mr-1 h-3 w-3" /> {report.categories} -{" "}
                            {report.heuristics}
                        </span>
                    </div>
                    <div className="mb-2 text-sm text-white/70">
                        <span className="inline-flex items-center">
                            <User className="mr-1 h-3 w-3" /> {report.players}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs text-white/50">
                        <span>ID: #{report.reportId}</span>
                        <span>{report.createdAt}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
