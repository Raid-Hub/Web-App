import { cn } from "~/lib/tw"
import type { ReportDetails } from "~/lib/types"
import { Badge } from "~/shad/badge"

interface InstanceInfoTabProps {
    reportDetails: ReportDetails
}

export function InstanceInfoTab({ reportDetails }: InstanceInfoTabProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-sm border border-white/10 bg-black/40 p-4">
                    <h3 className="mb-3 text-base font-medium">Instance Information</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-white/60">Instance ID:</span>
                            <span>{reportDetails.instanceId}</span>
                        </div>
                        {reportDetails.blacklist && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Blacklist Status:</span>
                                    <Badge
                                        variant="outline"
                                        className="rounded-sm border-red-400/30 bg-red-900/20 text-red-400">
                                        Blacklisted
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Report Source:</span>
                                    <span>{reportDetails.blacklist.reportSource}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">CheatCheck Version:</span>
                                    <span>{reportDetails.blacklist.cheatCheckVersion}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="rounded-sm border border-white/10 bg-black/40 p-4">
                    <h3 className="mb-3 text-base font-medium">Instance Flags</h3>
                    {reportDetails.flags.length > 0 ? (
                        <div className="space-y-2">
                            {reportDetails.flags.map((flag, index) => (
                                <div
                                    key={index}
                                    className="rounded-sm border border-white/10 bg-black/30 p-2 text-sm">
                                    <div className="mb-1 flex justify-between">
                                        <span className="text-white/60">Flagged At:</span>
                                        <span>{flag.flaggedAt}</span>
                                    </div>
                                    <div className="mb-1 flex justify-between">
                                        <span className="text-white/60">Cheat Probability:</span>
                                        <span
                                            className={cn(
                                                flag.cheatProbability > 0.8
                                                    ? "text-red-400"
                                                    : flag.cheatProbability > 0.5
                                                      ? "text-yellow-400"
                                                      : "text-green-400"
                                            )}>
                                            {(flag.cheatProbability * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Detection:</span>
                                        <span>{flag.cheatCheckBitmask.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-white/60">No flags detected for this instance</p>
                    )}
                </div>
            </div>

            {reportDetails.blacklist && (
                <div className="rounded-sm border border-white/10 bg-black/40 p-4">
                    <h3 className="mb-3 text-base font-medium">Blacklist Reason</h3>
                    <div className="rounded-sm border border-white/10 bg-black/30 p-3 text-sm">
                        {reportDetails.blacklist.reason}
                    </div>
                </div>
            )}
        </div>
    )
}
