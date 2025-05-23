import { type Metadata } from "next"
import { VanityDashboard } from "~/components/admin/vanity/vanity-dashboard"

export const metadata: Metadata = {
    title: "Vanity URL Dashboard"
}

export default function Page() {
    return <VanityDashboard />
}
