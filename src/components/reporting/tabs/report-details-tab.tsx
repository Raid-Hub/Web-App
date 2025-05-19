import { Clock } from "lucide-react"
import type { Report } from "~/lib/types"
import { Badge } from "~/shad/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/shad/table"

interface ReportDetailsTabProps {
    report: Report
}

export function ReportDetailsTab({ report }: ReportDetailsTabProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-4">
                    <div>
                        <h3 className="mb-1 text-sm font-medium text-white/60">Categories</h3>
                        <p className="text-sm">{report.categories}</p>
                    </div>
                    <div>
                        <h3 className="mb-1 text-sm font-medium text-white/60">Heuristics</h3>
                        <p className="text-sm">{report.heuristics}</p>
                    </div>
                    <div>
                        <h3 className="mb-1 text-sm font-medium text-white/60">Players Involved</h3>
                        <p className="text-sm">{report.players}</p>
                    </div>
                    <div>
                        <h3 className="mb-1 text-sm font-medium text-white/60">
                            Reporter In Instance
                        </h3>
                        <p className="text-sm">{report.isReporterInInstance ? "Yes" : "No"}</p>
                    </div>
                </div>
                <div>
                    <h3 className="mb-1 text-sm font-medium text-white/60">Explanation</h3>
                    <div className="rounded-sm border border-white/10 bg-black/40 p-3 text-sm">
                        {report.explanation}
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 pt-4">
                <h3 className="mb-2 text-sm font-medium">Status History</h3>
                <div className="overflow-hidden rounded-sm bg-black/20">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10">
                                <TableHead className="text-white/60">Date</TableHead>
                                <TableHead className="text-white/60">Status</TableHead>
                                <TableHead className="text-white/60">User</TableHead>
                                <TableHead className="text-white/60">Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="border-white/10">
                                <TableCell className="text-sm">{report.createdAt}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className="rounded-sm border-yellow-400/30 bg-yellow-900/20 text-yellow-400">
                                        <Clock className="mr-1 h-3 w-3" /> Created
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm">System</TableCell>
                                <TableCell className="text-sm">Report created</TableCell>
                            </TableRow>
                            {report.status === "IN_PROGRESS" && (
                                <TableRow className="border-white/10">
                                    <TableCell className="text-sm">{report.updatedAt}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="rounded-sm border-blue-400/30 bg-blue-900/20 text-blue-400">
                                            In Progress
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">Admin</TableCell>
                                    <TableCell className="text-sm">
                                        Report assigned and under review
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
