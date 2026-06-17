import { notFound } from "next/navigation"

/** Bare /profile has no player id — avoid vanity rewrite to /user/profile. */
export default function ProfileIndexPage() {
    notFound()
}
