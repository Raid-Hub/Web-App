"use client"

import { type PGCRReportStatus } from "@prisma/client"
import { FileWarning, Search } from "lucide-react"
import { useState } from "react"
import { AdminPageHeader } from "~/components/admin/admin-page-header"
import { ReportList } from "~/components/admin/reporting/report-list"
import { ReportPanel } from "~/components/admin/reporting/report-panel"
import { ReportingTabs } from "~/components/admin/reporting/reporting-tabs"
import { useLocalStorage } from "~/hooks/util/useLocalStorage"
import { Input } from "~/shad/input"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "~/shad/select"

export function ReportingDashboard() {
    const [selectedReportId, setSelectedReportId] = useState<number | null>(null)
    const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useLocalStorage<"all" | PGCRReportStatus>(
        "admin-report-filter",
        "all"
    )
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useLocalStorage<{
        key: "createdAt" | "closedAt"
        order: "asc" | "desc"
    }>("admin-report-sort", {
        key: "createdAt",
        order: "asc"
    })
    const handleValueChange = (value: string) => {
        switch (value) {
            case "newest":
                setSortBy({ key: "createdAt", order: "desc" })
                break
            case "oldest":
                setSortBy({ key: "createdAt", order: "asc" })
                break
            case "recentlyclosed":
                setSortBy({ key: "closedAt", order: "desc" })
        }
    }

    const handleViewReport = (reportId: number, instanceId: string) => {
        setSelectedReportId(reportId)
        setSelectedInstanceId(instanceId)
    }

    return (
        <div className="flex h-full w-full flex-1 flex-col">
            <AdminPageHeader
                title="PGCR Reports"
                description="View and manage player reports submitted through the PGCR page."
            />
            <div className="flex min-h-0 max-w-full flex-1 flex-col flex-wrap gap-2 md:flex-row">
                <div className="flex max-h-full max-w-full flex-col rounded-sm border border-white/10 bg-black/30 backdrop-blur-sm md:flex-1 md:basis-64">
                    <ReportingTabs
                        activeTab={activeTab}
                        onTabChange={v => setActiveTab(v as "all" | PGCRReportStatus)}
                    />

                    <div className="flex min-h-0 flex-1 flex-col">
                        <div className="3xl:flex-row mb-3 flex flex-col gap-2 p-3">
                            <div className="relative flex-1">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-white/50" />
                                <Input
                                    placeholder="Search by instance ID, membership ID, or category ID..."
                                    className="w-full rounded-sm border border-white/10 bg-black/40 px-3 py-2 pl-8 text-sm focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select onValueChange={handleValueChange} defaultValue="newest">
                                <SelectTrigger className="w-[180px] border-zinc-700/50 bg-zinc-900/90 text-zinc-200 focus:ring-1 focus:ring-zinc-500 focus:ring-offset-0">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-700/50 bg-zinc-900 text-zinc-200">
                                    <SelectGroup>
                                        <SelectItem
                                            value="newest"
                                            className="focus:bg-zinc-800 focus:text-zinc-100">
                                            Newest First
                                        </SelectItem>
                                        <SelectItem
                                            value="oldest"
                                            className="focus:bg-zinc-800 focus:text-zinc-100">
                                            Oldest First
                                        </SelectItem>
                                        <SelectItem
                                            value="recentlyclosed"
                                            className="focus:bg-zinc-800 focus:text-zinc-100">
                                            Recently Closed
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <ReportList
                                sort={sortBy.key}
                                sortOrder={sortBy.order}
                                activeTab={activeTab}
                                searchQuery={searchQuery}
                                selectedReportId={selectedReportId}
                                onSelectReport={handleViewReport}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex max-h-full min-h-0 max-w-full flex-1 rounded-sm border border-white/10 bg-black/30 backdrop-blur-sm md:min-w-120 md:flex-3 lg:flex-4 xl:flex-5">
                    {selectedReportId && selectedInstanceId ? (
                        <ReportPanel reportId={selectedReportId} instanceId={selectedInstanceId} />
                    ) : (
                        <div className="flex-1 self-center px-4 py-12 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-black/40">
                                <FileWarning className="h-6 w-6 text-white/60" />
                            </div>
                            <h3 className="mb-2 text-xl font-medium">No Report Selected</h3>
                            <p className="mx-auto max-w-md text-white/60">
                                Select a report from the list to view its details and take action.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
