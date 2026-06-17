import NotFound from "~/app/not-found"

/** Reserved path — without this page, /calendar is rewritten to /user/calendar and 404s via vanity lookup. */
export default function CalendarPage() {
    return <NotFound />
}
