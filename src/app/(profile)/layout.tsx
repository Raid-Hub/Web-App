import { type ReactNode } from "react"

/** PPR + profile streaming causes client-side DOM reconciliation errors on vanity/profile routes. */
export const experimental_ppr = false

export default function ProfileLayout({ children }: { children: ReactNode }) {
    return children
}
