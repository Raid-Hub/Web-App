import { Check, Shield, ShieldCheck, Trash, User, X } from "lucide-react"
import { toast } from "sonner"
import { trpc } from "~/app/trpc"
import { Button } from "~/shad/button"

export function ActionsTab({ reportId }: { reportId: number }) {
    const trpcUtils = trpc.useUtils()
    const closeMutation = trpc.admin.reporting.close.useMutation({
        onSuccess: () => {
            toast.success("Report closed successfully")
            void trpcUtils.admin.reporting.details.invalidate({ reportId })
            void trpcUtils.admin.reporting.recent.invalidate()
        },
        onError: err => {
            toast.error("Failed to close the report", {
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
            void trpcUtils.admin.reporting.details.invalidate({ reportId })
            void trpcUtils.admin.reporting.recent.invalidate()
        }
    })
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-sm border border-white/10 bg-black/40 p-4">
                <h3 className="mb-2 text-base font-medium">Update Report Status</h3>
                <p className="mb-4 text-sm text-white/60">
                    Change the current status of this report
                </p>

                <div className="flex flex-col gap-2">
                    <Button
                        className="text-primary-foreground space-x-1 rounded-sm bg-green-600 hover:bg-green-700"
                        onClick={() => closeMutation.mutate({ reportId, status: "ACCEPTED" })}>
                        <Check className="size-4" />
                        Accept Report
                    </Button>
                    <Button
                        className="text-primary-foreground space-x-1 rounded-sm bg-red-400 hover:bg-red-500"
                        onClick={() => closeMutation.mutate({ reportId, status: "REJECTED" })}>
                        <X className="size-4" />
                        Reject Report
                    </Button>
                    <Button
                        variant="destructive"
                        className="mt-4 space-x-1 rounded-sm"
                        onClick={() => deleteMutation.mutate({ reportId: 1 })}>
                        <Trash className="size-4" />
                        Delete Report
                    </Button>
                </div>
            </div>

            <div className="rounded-sm border border-white/10 bg-black/40 p-4">
                <h3 className="mb-2 text-base font-medium">Instance Actions</h3>
                <p className="mb-4 text-sm text-white/60">Take action on this instance</p>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start rounded-sm border-white/10 bg-black/40 hover:bg-black/60">
                            <Shield className="mr-2 size-4" />
                            Blacklist Instance
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start rounded-sm border-white/10 bg-black/40 hover:bg-black/60">
                            <User className="mr-2 size-4" />
                            Blacklist All Player-Instances
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start rounded-sm border-white/10 bg-black/40 hover:bg-black/60">
                            <ShieldCheck className="mr-2 size-4" />
                            Clear Instance
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
