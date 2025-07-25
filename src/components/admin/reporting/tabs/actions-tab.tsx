import { useQueryClient } from "@tanstack/react-query"
import { Check, Flag, Shield, ShieldCheck, Trash, TriangleAlert, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { trpc } from "~/lib/trpc"
import { type RaidHubInstanceStandingResponse } from "~/services/raidhub/types"
import { useRaidHubBlacklist } from "~/services/raidhub/useRaidHubBlacklist"
import { Button } from "~/shad/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "~/shad/dialog"
import { Form, FormField } from "~/shad/form"
import { MultiSelect } from "~/shad/multi-select"
import { Textarea } from "~/shad/textarea"
import { type PGCRReportDetails } from "~/types/api"
import { getBungieDisplayName } from "~/util/destiny"
import { ReportPanelItemBox } from "../report-panel-item-box"

export function ActionsTab({
    report,
    standing
}: {
    report: PGCRReportDetails
    standing: RaidHubInstanceStandingResponse
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isCurrentlyBlacklisted, setIsCurrentlyBlacklisted] = useState(!!standing.blacklist)

    const trpcUtils = trpc.useUtils()
    const closeMutation = trpc.admin.reporting.close.useMutation({
        onSuccess: () => {
            toast.success("Report closed successfully")
            void trpcUtils.admin.reporting.details.invalidate({ reportId: report.reportId })
            void trpcUtils.admin.reporting.recent.invalidate()
        },
        onError: err => {
            toast.error("Failed to close the report", {
                description: err.message
            })
        }
    })
    const closeManyMutation = trpc.admin.reporting.closeMany.useMutation({
        onSuccess: () => {
            toast.success("Reports closed successfully")
            void trpcUtils.admin.reporting.details.invalidate({ reportId: report.reportId })
            void trpcUtils.admin.reporting.recent.invalidate()
        },
        onError: err => {
            toast.error("Failed to close the reports", {
                description: err.message
            })
        }
    })
    const deleteMutation = trpc.admin.reporting.delete.useMutation({
        onSuccess: () => {
            toast.success("Report deleted successfully")
        },
        onError: err => {
            toast.error("Failed to delete report", {
                description: err.message
            })
            void trpcUtils.admin.reporting.details.invalidate({ reportId: report.reportId })
            void trpcUtils.admin.reporting.recent.invalidate()
        }
    })

    const queryClient = useQueryClient()
    const blacklistInstanceMutation = useRaidHubBlacklist(standing.instanceDetails.instanceId, {
        onSuccess: isBlacklisted => {
            setIsCurrentlyBlacklisted(isBlacklisted)
            setIsDialogOpen(false)
            toast.success(
                `Successfully ${isBlacklisted ? "blacklisted" : "unblacklisted"} instance ${standing.instanceDetails.instanceId}`
            )
            blacklistForm.reset()
            void queryClient.invalidateQueries({
                queryKey: ["raidhub", "reports", standing.instanceDetails.instanceId]
            })
        },
        onError: error => {
            toast.error(
                `Failed to ${isCurrentlyBlacklisted ? "unblacklist" : "blacklist"} instance ${standing.instanceDetails.instanceId}`,
                {
                    description: error.message
                }
            )
        }
    })

    const blacklistForm = useForm<{
        readonly reason: string
        readonly players: string[]
    }>({
        defaultValues: {
            reason: report.explanation,
            players: standing.players
                .filter(p => p.flags.length > 0)
                .map(p => p.playerInfo.membershipId)
        }
    })
    const blacklistReason = blacklistForm.watch("reason")
    const { isValid } = blacklistForm.formState

    const handleConfirmBlacklist = blacklistForm.handleSubmit(formValues => {
        blacklistInstanceMutation.mutate({
            reportId: report.reportId,
            removeBlacklist: false,
            reason: blacklistReason,
            players: formValues.players.map(membershipId => ({
                membershipId,
                reason: `Report #${report.reportId} - ${blacklistReason}`
            }))
        })
    })

    const handleUnblacklist = () => {
        blacklistInstanceMutation.mutate({
            reportId: report.reportId,
            reason: "Instance cleared from blacklist",
            removeBlacklist: true
        })
    }

    return (
        <div className="flex flex-wrap gap-4">
            <ReportPanelItemBox
                className="min-w-56"
                title="Instance Actions"
                description="Change the standing of this instance">
                <div className="space-y-2">
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        variant="outline"
                        className="w-full justify-start rounded-sm border-white/10 bg-black/40 hover:bg-black/60">
                        <Shield className="mr-2 size-4" />
                        Blacklist Instance
                    </Button>
                    <Button
                        onClick={handleUnblacklist}
                        disabled={blacklistInstanceMutation.isLoading || !isCurrentlyBlacklisted}
                        variant="outline"
                        className="w-full justify-start rounded-sm border-white/10 bg-black/40 hover:bg-black/60">
                        <ShieldCheck className="mr-2 size-4" />
                        Clear Instance
                    </Button>
                </div>
            </ReportPanelItemBox>

            <ReportPanelItemBox
                className="min-w-56"
                title="Update Report Status"
                description="Change the current status of this report">
                <div className="flex flex-col gap-2">
                    <Button
                        disabled={report.status === "ACCEPTED"}
                        className="text-primary-foreground space-x-1 rounded-sm bg-green-600 hover:bg-green-700"
                        onClick={() =>
                            closeMutation.mutate({ reportId: report.reportId, status: "ACCEPTED" })
                        }>
                        <Check className="size-4" />
                        Accept Report
                    </Button>
                    <Button
                        className="text-primary-foreground space-x-1 rounded-sm bg-green-400 hover:bg-green-500"
                        onClick={() =>
                            closeManyMutation.mutate({
                                instanceId: report.instanceId,
                                status: "ACCEPTED"
                            })
                        }>
                        <Check className="size-4" />
                        Accept All Similar Reports
                    </Button>
                    <Button
                        disabled={report.status === "REJECTED"}
                        className="text-primary-foreground space-x-1 rounded-sm bg-red-400 hover:bg-red-500"
                        onClick={() =>
                            closeMutation.mutate({ reportId: report.reportId, status: "REJECTED" })
                        }>
                        <X className="size-4" />
                        Reject Report
                    </Button>
                    <Button
                        variant="destructive"
                        className="mt-4 space-x-1 rounded-sm"
                        onClick={() => deleteMutation.mutate({ reportId: report.reportId })}>
                        <Trash className="size-4" />
                        Delete Report
                    </Button>
                </div>
            </ReportPanelItemBox>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <Form {...blacklistForm}>
                        <form onSubmit={handleConfirmBlacklist} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle>Blacklist Instance</DialogTitle>
                                <DialogDescription>
                                    Add this instance to the blacklist. This will prevent it from
                                    appearing in leaderboards or tags on a user&apos;s profile.
                                </DialogDescription>
                            </DialogHeader>
                            <FormField
                                control={blacklistForm.control}
                                name="reason"
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className="text-sm"
                                        placeholder="Enter reason for blacklisting this instance..."
                                    />
                                )}
                            />
                            <MultiSelect
                                label="Players Involved"
                                control={blacklistForm.control}
                                options={standing.players.map(player => ({
                                    id: player.playerInfo.membershipId,
                                    label: (
                                        <div className="flex items-center gap-2">
                                            {getBungieDisplayName(player.playerInfo)}
                                            {player.flags.length > 0 && (
                                                <Flag size={16} className="text-red-400" />
                                            )}
                                            {report.players.includes(
                                                player.playerInfo.membershipId
                                            ) && (
                                                <TriangleAlert
                                                    size={16}
                                                    className="text-yellow-400"
                                                />
                                            )}
                                        </div>
                                    ),
                                    value: player.playerInfo.membershipId
                                }))}
                                name="players"
                            />
                            <DialogFooter className="sm:justify-end">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setIsDialogOpen(false)
                                        blacklistForm.reset()
                                    }}
                                    className="rounded-sm">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    onClick={handleConfirmBlacklist}
                                    disabled={blacklistInstanceMutation.isLoading || !isValid}
                                    className="rounded-sm bg-red-600 text-white hover:bg-red-700">
                                    Blacklist Instance
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
