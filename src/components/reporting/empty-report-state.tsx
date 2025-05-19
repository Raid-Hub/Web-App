import { FileWarning } from "lucide-react"

export function EmptyReportState() {
    return (
        <div className="col-span-3 flex items-center justify-center rounded-sm border border-white/10 bg-black/30 backdrop-blur-sm md:col-span-2">
            <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-black/40">
                    <FileWarning className="h-6 w-6 text-white/60" />
                </div>
                <h3 className="mb-2 text-xl font-medium">No Report Selected</h3>
                <p className="mx-auto max-w-md text-white/60">
                    Select a report from the list to view its details and take action.
                </p>
            </div>
        </div>
    )
}
