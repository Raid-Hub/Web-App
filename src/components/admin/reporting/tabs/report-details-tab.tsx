import { Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { pgcrReportHeuristics, pgcrReportReasons } from "~/lib/reporting"
import { cn } from "~/lib/tw"
import { type InstancePlayerStanding } from "~/services/raidhub/types"
import { useRaidHubResolvePlayer } from "~/services/raidhub/useRaidHubResolvePlayer"
import { Badge } from "~/shad/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/shad/table"
import { type PGCRReportDetails } from "~/types/api"
import { bungieIconUrl, getBungieDisplayName } from "~/util/destiny"
import { ReportPanelItemBox } from "../report-panel-item-box"

interface ReportDetailsTabProps {
    report: PGCRReportDetails
    players: readonly InstancePlayerStanding[]
}

export function ReportDetailsTab({ report, players }: ReportDetailsTabProps) {
    const { data: reporter, isSuccess } = useRaidHubResolvePlayer(
        report.reporter.destinyMembershipId
    )

    return (
        <div className="flex-1 space-y-4">
            <ReportPanelItemBox className="space-y-4" title="Report Information">
                <ReportInfoLine title="Instance Link">
                    <Link
                        href={`/pgcr/${report.instanceId}`}
                        target="_blank"
                        className="text-hyperlink text-sm">
                        {report.instanceId}
                    </Link>
                </ReportInfoLine>

                <ReportInfoLine title="Reporter">
                    <div className="flex items-center gap-2">
                        <Image
                            unoptimized
                            src={bungieIconUrl(reporter?.iconPath)}
                            alt="icon"
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full"
                        />
                        <Link
                            href={`/profile/${report.reporter.destinyMembershipId}`}
                            target="_blank"
                            className="text-sm text-white/80">
                            {isSuccess ? getBungieDisplayName(reporter) : "Unknown"}
                        </Link>
                    </div>
                </ReportInfoLine>

                <ReportInfoLine title="Reporter In Instance">
                    <p className="text-sm">{report.isReporterInInstance ? "Yes" : "No"}</p>
                </ReportInfoLine>

                <ReportInfoLine title="Categories">
                    <div className="mt-2 flex flex-wrap gap-2">
                        {report.categories.map((category: string, idx: number) => (
                            <Badge
                                key={idx}
                                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                                {pgcrReportReasons.find(r => r.id === category)?.label ?? category}
                            </Badge>
                        ))}
                    </div>
                </ReportInfoLine>

                {report.heuristics.length > 0 && (
                    <ReportInfoLine title="Heuristics">
                        <div className="mt-2 flex flex-wrap gap-2">
                            {report.heuristics.map((heuristic: string, idx: number) => (
                                <Badge
                                    key={idx}
                                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                                    {pgcrReportHeuristics.find(r => r.id === heuristic)?.label ??
                                        heuristic}
                                </Badge>
                            ))}
                        </div>
                    </ReportInfoLine>
                )}

                <ReportInfoLine title="Players Reported">
                    <ul className="mt-2 flex flex-wrap gap-1.5 text-sm">
                        {report.players.map(membershipId => {
                            const info = players.find(
                                p => p.playerInfo.membershipId === membershipId
                            )?.playerInfo ?? { membershipId, iconPath: null }
                            const username = getBungieDisplayName(info)
                            return (
                                <li
                                    key={membershipId}
                                    className="rounded-full border border-zinc-700/50 bg-zinc-800/80 px-2.5 py-1 text-zinc-200 shadow-sm">
                                    <Link
                                        href={`/profile/${info.membershipId}`}
                                        className="inline-flex items-center"
                                        target="_blank">
                                        <Image
                                            unoptimized
                                            src={bungieIconUrl(info.iconPath)}
                                            alt="icon"
                                            width={24}
                                            height={24}
                                            className="mr-2 h-4 w-4 rounded-full"
                                        />
                                        <span className="max-w-[30ch] truncate">{username}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </ReportInfoLine>

                <ReportInfoLine title="Provided Explanation">
                    <p className="text-sm text-wrap">{report.explanation}</p>
                </ReportInfoLine>
            </ReportPanelItemBox>

            <ReportPanelItemBox title="Status History" className="md:max-w-120 xl:max-w-none">
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
                        {!!report.closedAt && ["ACCEPTED", "REJECTED"].includes(report.status) && (
                            <TableRow className="border-white/10">
                                <TableCell className="text-sm">
                                    {report.closedAt.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn("", {
                                            "rounded-sm border-red-400/30 bg-red-900/20 text-red-400":
                                                report.status === "REJECTED",
                                            "rounded-sm border-green-400/30 bg-green-900/20 text-green-400":
                                                report.status === "ACCEPTED"
                                        })}>
                                        <Clock className="mr-1 h-3 w-3" />
                                        {report.status === "ACCEPTED" ? "Accepted" : "Rejected"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {report.closedBy?.name ?? "System"}
                                </TableCell>
                                <TableCell className="text-sm">
                                    Report {report.status === "ACCEPTED" ? "accepted" : "rejected"}
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow className="border-white/10">
                            <TableCell className="text-sm">
                                {report.createdAt.toLocaleString()}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className="rounded-sm border-blue-400/30 bg-blue-900/20 text-blue-400">
                                    <Clock className="mr-1 h-3 w-3" />
                                    Created
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{report.reporter.name}</TableCell>
                            <TableCell className="text-sm">Report created</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </ReportPanelItemBox>
        </div>
    )
}

interface ReportInfoLineProps {
    title: string
    children: React.ReactNode
}
const ReportInfoLine = ({ title, children }: ReportInfoLineProps) => {
    return (
        <div>
            <h3 className="mb-1 text-sm font-medium text-white/60">{title}</h3>
            {children}
        </div>
    )
}
