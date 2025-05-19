"use client"

import { Search } from "lucide-react"
import { useState } from "react"
import { AdminPageHeader } from "~/components/admin-page-header"
import { EmptyReportState } from "~/components/reporting/empty-report-state"
import { ReportDetails } from "~/components/reporting/report-details"
import { ReportList } from "~/components/reporting/report-list"
import { ReportingTabs } from "~/components/reporting/reporting-tabs"
import { mockReports } from "~/lib/mock-data"

export default function ReportingDashboardPage() {
    const [selectedReport, setSelectedReport] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("newest")

    const handleViewReport = (reportId: number) => {
        setSelectedReport(reportId)
    }

    // Filter reports based on active tab and search query
    const filteredReports = mockReports
        .filter(report => activeTab === "all" || report.status === activeTab.toUpperCase())
        .filter(
            report =>
                searchQuery === "" ||
                report.instanceId.includes(searchQuery) ||
                report.players.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.categories.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.heuristics.toLowerCase().includes(searchQuery.toLowerCase())
        )
        // Sort reports
        .sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                case "priority":
                    // Higher priority for pending reports
                    const priorityOrder = { PENDING: 3, IN_PROGRESS: 2, RESOLVED: 1, REJECTED: 0 }
                    return priorityOrder[b.status] - priorityOrder[a.status]
                default:
                    return 0
            }
        })

    return (
        <div className="space-y-4 p-4 md:space-y-6 md:p-6">
            <AdminPageHeader
                title="PGCR Reports"
                description="View and manage player reports submitted through the PGCR page."
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="col-span-3 overflow-hidden rounded-sm border border-white/10 bg-black/30 backdrop-blur-sm md:col-span-1">
                    <ReportingTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    <div className="p-3">
                        <div className="mb-3 flex flex-col gap-2 md:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-white/50" />
                                <input
                                    placeholder="Search by ID, player, or category..."
                                    className="w-full rounded-sm border border-white/10 bg-black/40 px-3 py-2 pl-8 text-sm focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                className="rounded-sm border border-white/10 bg-black/40 px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}>
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="priority">By Priority</option>
                            </select>
                        </div>
                        <ReportList
                            reports={filteredReports}
                            selectedReport={selectedReport}
                            onSelectReport={handleViewReport}
                        />
                    </div>
                </div>

                {selectedReport ? (
                    <ReportDetails reportId={selectedReport} />
                ) : (
                    <EmptyReportState />
                )}
            </div>
        </div>
    )
}
