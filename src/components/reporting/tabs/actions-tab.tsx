import { AlertCircle, Shield, ShieldCheck, User } from "lucide-react"
import { Button } from "~/shad/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/shad/select"

export function ActionsTab() {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-sm border border-white/10 bg-black/40 p-4">
                <h3 className="mb-2 text-base font-medium">Update Report Status</h3>
                <p className="mb-4 text-sm text-white/60">
                    Change the current status of this report
                </p>

                <div className="space-y-4">
                    <Select defaultValue="pending">
                        <SelectTrigger className="rounded-sm border-white/10 bg-black/40">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-sm border-white/10 bg-black/90">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>

                    <div>
                        <label className="mb-1 block text-sm text-white/60">Notes</label>
                        <textarea
                            className="h-24 w-full resize-none rounded-sm border border-white/10 bg-black/40 p-2 text-sm focus:ring-1 focus:ring-orange-500 focus:outline-none"
                            placeholder="Add notes about this status change..."
                        />
                    </div>

                    <Button className="w-full rounded-sm bg-orange-600 hover:bg-orange-700">
                        Update Status
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
                            <Shield className="mr-2 h-4 w-4" />
                            Blacklist Instance
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start rounded-sm border-white/10 bg-black/40 hover:bg-black/60">
                            <User className="mr-2 h-4 w-4" />
                            Blacklist Players
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start rounded-sm border-white/10 bg-black/40 hover:bg-black/60">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Clear Instance
                        </Button>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <Button variant="destructive" className="w-full rounded-sm">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Delete Report
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
