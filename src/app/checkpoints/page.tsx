import { notFound } from "next/navigation"

/** Reserved path — without this page, /checkpoints is rewritten to /user/checkpoints and 404s via vanity lookup. */
export default function CheckpointsPage() {
    notFound()
}
