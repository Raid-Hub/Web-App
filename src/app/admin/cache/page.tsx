import { type Metadata } from "next"
import { CacheDashboard } from "~/components/admin/cache/cache-dashboard"

export const metadata: Metadata = {
    title: "Cache"
}

export default function Page() {
    return <CacheDashboard />
}
