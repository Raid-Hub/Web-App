import { FileWarning, Flag, Pencil, User } from "lucide-react"
import { useMemo } from "react"
import { trpc } from "~/app/trpc"
import { StatusBadge } from "~/components/admin/reporting/status-badge"
import { pgcrReportHeuristics, pgcrReportReasons } from "~/lib/reporting"
import { cn } from "~/lib/tw"
import { getRelativeTime } from "~/util/presentation/pastDates"

interface ReportListProps {
    sort: "createdAt" | "closedAt"
    sortOrder: "asc" | "desc"
    activeTab: "all" | "PENDING" | "ACCEPTED" | "REJECTED"
    searchQuery: string
    selectedReportId: number | null
    onSelectReport: (reportId: number, instanceId: string) => void
}

export function ReportList({
    sort,
    sortOrder,
    activeTab,
    searchQuery,
    selectedReportId,
    onSelectReport
}: ReportListProps) {
    const {
        data: recentReports,
        isLoading,
        isError
    } = trpc.admin.reporting.recent.useQuery(
        {
            sort,
            sortOrder,
            status: activeTab === "all" ? null : activeTab
        },
        {
            keepPreviousData: true
        }
    )

    // Filter reports based on active tab and search query
    const filteredReports = useMemo(() => {
        if (!recentReports) return []

        const lowerQuery = searchQuery.toLowerCase()

        return recentReports.filter(
            report =>
                !searchQuery ||
                report.instanceId.includes(searchQuery) ||
                report.players.some(p => p.includes(lowerQuery)) ||
                report.categories.some(c => c.toLowerCase().includes(lowerQuery)) ||
                report.heuristics.some(h => h.toLowerCase().includes(lowerQuery))
        )
    }, [searchQuery, recentReports])

    if (isLoading) {
        return <div className="p-4">Loading...</div>
    } else if (isError) {
        return (
            <div className="p-4">
                <div className="flex items-center justify-center rounded-sm border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
                    <FileWarning className="h-6 w-6 text-white/60" />
                    <p className="ml-2 text-white/60">Failed to load reports. Please try again.</p>
                </div>
            </div>
        )
    }

    if (filteredReports.length === 0) {
        return (
            <div className="py-8 text-center text-white/60">
                <p>No reports match your criteria</p>
            </div>
        )
    }

    return (
        <div className="max-h-[calc(100vh-280px)] space-y-2 overflow-y-auto pr-2">
            {filteredReports.map(report => (
                <div
                    key={report.reportId}
                    className={cn(
                        "cursor-pointer rounded-sm border p-3 transition-colors",
                        selectedReportId === report.reportId
                            ? "border-raidhub/50 bg-black/50"
                            : "border-white/10 bg-black/30 hover:border-white/20"
                    )}
                    onClick={() => onSelectReport(report.reportId, report.instanceId)}>
                    <div className="mb-2 flex items-start justify-between">
                        <div className="font-light">Report #{report.reportId}</div>
                        <StatusBadge status={report.status} />
                    </div>
                    <div className="mb-1 text-sm text-white/70">
                        <span className="inline-flex items-center gap-1">
                            <Pencil className="mr-1 size-3" />{" "}
                            {report.categories
                                .map(c => pgcrReportReasons.find(r => r.id === c)?.label ?? c)
                                .join(", ")}
                        </span>
                    </div>
                    {report.heuristics.length > 0 && (
                        <div className="mb-1 text-sm text-white/70">
                            <span className="inline-flex items-center gap-1">
                                <Flag className="mr-1 size-3" />{" "}
                                {report.heuristics
                                    .map(
                                        h => pgcrReportHeuristics.find(r => r.id === h)?.label ?? h
                                    )
                                    .join(", ")}
                            </span>
                        </div>
                    )}
                    <div className="mb-2 text-sm text-white/70">
                        <span className="inline-flex items-center gap-1">
                            <User className="mr-1 size-3 shrink-0" /> {report.players.length}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs text-white/50">
                        <span>Instance: #{report.instanceId}</span>
                        <span>{getRelativeTime(report.createdAt)}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
