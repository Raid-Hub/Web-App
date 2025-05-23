import { AddBadgeForm } from "./add-badge-form"
import { BadgesDisplay } from "./badges-display"
import { CreateBadgeForm } from "./create-badge-form"
import { RemoveBadgeForm } from "./remove-badge-form"

export function BadgeDashboard() {
    return (
        <div className="flex w-full flex-col items-center justify-center gap-6 p-6">
            <BadgesDisplay />
            <CreateBadgeForm />
            <AddBadgeForm />
            <RemoveBadgeForm />
        </div>
    )
}
