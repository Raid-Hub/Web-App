import { type ReactNode } from "react"

/** notFound() under global PPR serves a 200 shell and triggers client RSC errors. */
export const experimental_ppr = false

export default function CheckpointsLayout({ children }: { children: ReactNode }) {
    return children
}
