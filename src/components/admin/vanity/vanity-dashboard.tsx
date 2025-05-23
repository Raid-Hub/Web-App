import { AddVanityForm } from "./add-vanity-form"
import { RemoveVanityForm } from "./remove-vanity-form"

export function VanityDashboard() {
    return (
        <div className="flex w-full flex-col items-center justify-center gap-6 p-6">
            <AddVanityForm />
            <RemoveVanityForm />
        </div>
    )
}
