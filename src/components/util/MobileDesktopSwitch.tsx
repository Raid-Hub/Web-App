"use client"

import { Children, cloneElement, isValidElement, type ReactNode } from "react"

export const MobileDesktopSwitch = (props: {
    sm: JSX.Element
    lg: JSX.Element
    children?: ReactNode
}) => {
    return (
        <>
            {Children.map(
                props.sm,
                child =>
                    isValidElement(child) &&
                    cloneElement(child, {
                        //  @ts-expect-error - manual injection here
                        className: [child.props.className, "switch-sm"].filter(Boolean).join(" ")
                    })
            )}
            {Children.map(
                props.lg,
                child =>
                    isValidElement(child) &&
                    cloneElement(child, {
                        //  @ts-expect-error - manual injection here
                        className: [child.props.className, "switch-lg"].filter(Boolean).join(" ")
                    })
            )}
            {props.children}
        </>
    )
}
