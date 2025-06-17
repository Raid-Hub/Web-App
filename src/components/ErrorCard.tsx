import React from "react"
import { cn } from "~/lib/tw"

export const ErrorCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} {...props} className={cn("bg-red-400 p-4", className)} role="alert">
            {children}
        </div>
    )
)
ErrorCard.displayName = "ErrorCard"
