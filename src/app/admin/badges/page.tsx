import { type Metadata } from "next"
import { BadgeDashboard } from "~/components/admin/badge/badge-dashboard"

export const metadata: Metadata = {
    title: "Manage Badges"
}

export default function Page() {
    return <BadgeDashboard />
}
