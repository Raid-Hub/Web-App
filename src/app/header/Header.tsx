import { type ReactNode } from "react"
import { BackdropBlur } from "~/components/__deprecated__/BackdropBlur"

export const Header = (props: { children: ReactNode }) => {
    return (
        <header
            id="header"
            className="h-header bg-background-dark/85 sticky top-0 z-50 min-w-full border-b border-white/10 p-2">
            {props.children}
            <BackdropBlur $radius={8} />
        </header>
    )
}
