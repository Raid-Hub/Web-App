import React from "react"
import { type SVGProps } from "../SVG"

const Warlock = React.forwardRef<SVGSVGElement, SVGProps>((props, ref) => {
    return (
        <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...props}>
            <path
                fill="currentColor"
                d="m5.442 23.986 7.255-11.65-2.71-4.322-9.987 15.972zm5.986 0 4.28-6.849-2.717-4.333-6.992 11.182zm7.83-11.611 7.316 11.611h5.426l-10.015-15.972zm-7.26 11.611h8.004l-4.008-6.392zm6.991-11.182-2.703 4.324 4.302 6.858h5.413zm-5.707-.459 2.71-4.331 2.71 4.331-2.703 4.326z"
            />
        </svg>
    )
})
Warlock.displayName = "WarlockIcon"

export default Warlock
