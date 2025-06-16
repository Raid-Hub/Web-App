"use client"

import { createContext, forwardRef, useContext, type ReactNode } from "react"
import { cn } from "~/lib/tw"

const PropsContext = createContext<object | null>(null)

export const PageWrapper = forwardRef<
    HTMLDivElement,
    {
        children: ReactNode
        className?: string
        pageProps?: object
    } & PageWrapperStyleProps
>(({ children, pageProps, className, ...props }, ref) => (
    <PropsContext.Provider value={pageProps ?? {}}>
        <div
            ref={ref}
            {...props}
            className={cn("mx-auto mt-2 mb-6 w-[95%] lg:w-[90%] xl:w-[85%]", className)}>
            {children}
        </div>
    </PropsContext.Provider>
))
PageWrapper.displayName = "PageWrapper"

/**
 * Custom hook that retrieves the page props from the PropsContext.
 * @template T - The type of the page props.
 * @returns The page props of type T.
 * @throws {Error} If used outside of a PageWrapper.
 */
export const usePageProps = <T extends object>() => {
    const pageProps = useContext(PropsContext)
    if (pageProps === null) throw new Error("usePageProps must be used within a PageWrapper")
    return pageProps as T
}
type PageWrapperStyleProps = {
    $maxWidth?: number
}
