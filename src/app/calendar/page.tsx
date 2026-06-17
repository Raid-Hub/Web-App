import { notFound } from "next/navigation"

/** Reserved path — without this page, /calendar is rewritten to /user/calendar and 404s via vanity lookup. */
export default function CalendarPage() {
    notFound()
}
