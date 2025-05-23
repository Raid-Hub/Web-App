import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, Check } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"
import { usePGCRContext } from "~/hooks/pgcr/ClientStateManager"
import { pgcrReportHeuristics, pgcrReportReasons, zPgcrReport } from "~/lib/reporting"
import { trpc } from "~/lib/trpc"
import { Button } from "~/shad/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "~/shad/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "~/shad/form"
import { MultiSelect } from "~/shad/multi-select"
import { Textarea } from "~/shad/textarea"
import { getBungieDisplayName } from "~/util/destiny"

type ReportFormValues = z.infer<typeof zPgcrReport>

interface ReportModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    reporterProfiles: string[]
}

export const ReportModal = ({ open, onOpenChange, reporterProfiles }: ReportModalProps) => {
    const { data } = usePGCRContext()

    const form = useForm<ReportFormValues>({
        resolver: zodResolver(zPgcrReport),
        defaultValues: {
            categories: [],
            explanation: "",
            suspectedPlayers: [],
            heuristics: []
        }
    })

    const { isSuccess, isLoading, mutate } = trpc.reporting.reportPGCR.useMutation({
        onError: error => {
            toast.error(error.message)
        }
    })

    const submitHandler = form.handleSubmit(values => {
        mutate({
            ...values,
            instanceId: data.instanceId,
            selfParticipation: data.players.some(player =>
                reporterProfiles.includes(player.playerInfo.membershipId)
            )
        })
    })

    const reportReasons = form.watch("categories")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 rounded-full bg-green-500/20 p-3">
                            <Check className="h-8 w-8 text-green-500" />
                        </div>
                        <h2 className="mb-2 text-xl font-semibold">Report Submitted</h2>
                        <p className="mb-6 text-zinc-400">Thank you for your report.</p>
                        <Button onClick={() => onOpenChange(false)}>Close</Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Report Raid
                            </DialogTitle>
                            <DialogDescription>
                                Submit a report for this raid to the RaidHub administrators if you
                                believe it was completed using cheats or should be invalidated
                                across any leaderboards.
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                            <form onSubmit={submitHandler} className="space-y-6">
                                <MultiSelect
                                    options={pgcrReportReasons.map(r => ({ ...r, value: r.id }))}
                                    control={form.control}
                                    name="categories"
                                    label="Reason for reporting"
                                    description="Select all that apply"
                                />

                                {reportReasons.includes("cheating") && (
                                    <MultiSelect
                                        options={pgcrReportHeuristics.map(r => ({
                                            ...r,
                                            value: r.id
                                        }))}
                                        control={form.control}
                                        name="heuristics"
                                        label="Cheating Heuristics"
                                        description="Select all that apply, or leave blank if none apply"
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="explanation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Explanation</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Please provide details about what you observed..."
                                                    className="h-24 resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Please be as specific as possible with comparisons,
                                                stats, or analysis
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <MultiSelect
                                    options={data.players.map(player => ({
                                        id: player.playerInfo.membershipId,
                                        value: player.playerInfo.membershipId,
                                        label: getBungieDisplayName(player.playerInfo)
                                    }))}
                                    control={form.control}
                                    name="suspectedPlayers"
                                    label="Suspected Players"
                                    description="Selected all players involved in the reported behavior"
                                    showSelectAllButton
                                    showUnselectAllButton
                                />

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                        disabled={isLoading}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Submitting..." : "Submit Report"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
