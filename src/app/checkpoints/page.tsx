import NotFound from "~/app/not-found"

/** Reserved path — without this page, /checkpoints is rewritten to /user/checkpoints and 404s via vanity lookup. */
export default function CheckpointsPage() {
    return <NotFound />
}
