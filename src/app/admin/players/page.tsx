import { type Metadata } from "next"
import { PlayerStandingDashboard } from "~/components/admin/players/player-standing-dashboard"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Player Standing"
}

export default function Page() {
    return <PlayerStandingDashboard />
}
