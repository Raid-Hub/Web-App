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

interface ReportDetailsTabProps {
    report: PGCRReportDetails
    players: readonly InstancePlayerStanding[]
}

export function ReportDetailsTab({ report, players }: ReportDetailsTabProps) {
    const { data: reporter, isSuccess } = useRaidHubResolvePlayer(
        report.reporter.destinyMembershipId
    )

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-4">
                    <div>
                        <h3 className="mb-1 text-sm font-medium text-white/60">Instance Link</h3>
                        <Link
                            href={`/pgcr/${report.instanceId}`}
                            target="_blank"
                            className="text-hyperlink text-sm">
                            {report.instanceId}
                        </Link>
                    </div>

                    <div>
                        <h3 className="mb-1 text-sm font-medium text-white/60">Reporter</h3>
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
                    </div>

                    <div>
                        <h3 className="mb-1 text-sm font-medium text-white/60">
                            Reporter In Instance
                        </h3>
                        <p className="text-sm">{report.isReporterInInstance ? "Yes" : "No"}</p>
                    </div>

                    <div>
                        <h3 className="mb-1 text-sm font-medium text-white/60">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                            {report.categories.map((category: string, idx: number) => (
                                <Badge
                                    key={idx}
                                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                                    {pgcrReportReasons.find(r => r.id === category)?.label ??
                                        category}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {report.heuristics.length > 0 && (
                        <div>
                            <h3 className="mb-1 text-sm font-medium text-white/60">Heuristics</h3>
                            <div className="flex flex-wrap gap-2">
                                {report.heuristics.map((heuristic: string, idx: number) => (
                                    <Badge
                                        key={idx}
                                        className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                                        {pgcrReportHeuristics.find(r => r.id === heuristic)
                                            ?.label ?? heuristic}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="mb-1 text-sm font-medium text-white/60">Players Reported</h3>
                        <ul className="mt-1 flex flex-wrap gap-1.5 text-sm">
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
                                            <span className="max-w-[30ch] truncate">
                                                {username}
                                            </span>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col">
                    <h3 className="mb-1 text-sm font-medium text-white/60">Explanation</h3>
                    <div className="flex-1 rounded-sm border border-white/10 bg-black/40 p-3 text-sm">
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
                            {!!report.closedAt &&
                                ["ACCEPTED", "REJECTED"].includes(report.status) && (
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
                                                {report.status === "ACCEPTED"
                                                    ? "Accepted"
                                                    : "Rejected"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {report.closedBy?.name ?? "System"}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            Report{" "}
                                            {report.status === "ACCEPTED" ? "accepted" : "rejected"}
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
                </div>
            </div>
        </div>
    )
}
