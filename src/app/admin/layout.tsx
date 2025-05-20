import { type Metadata } from "next"
import { redirect } from "next/navigation"
import { type ReactNode } from "react"
import { getServerSession } from "~/lib/server/auth"
import { SidebarProvider } from "~/shad/sidebar"
import { AdminSidebar } from "./sidebar"

export default async function Layout({ children }: { children: ReactNode }) {
    const session = await getServerSession()

    if (session?.user.role !== "ADMIN") {
        redirect("/")
    }

    return (
        <SidebarProvider className="md:max-h-body md:overflow-hidden">
            <AdminSidebar />
            <main className="md:max-h-body flex-1 overflow-auto">
                {/* <div className="absolute top-0 z-10 flex items-center">
                        <SidebarTrigger className="h-8 w-8" />
                    </div> */}

                {children}
            </main>
        </SidebarProvider>
    )
}

export const metadata: Metadata = {
    robots: {
        follow: false,
        index: false
    },
    keywords: null,
    openGraph: null
}
