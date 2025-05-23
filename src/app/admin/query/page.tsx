import { type Metadata } from "next"
import { QueryDashboard } from "~/components/admin/query/query-dashboard"

export const metadata: Metadata = {
    title: "SQL Query Tool"
}

export default function Page() {
    return <QueryDashboard />
}
