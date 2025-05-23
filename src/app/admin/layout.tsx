import { type Metadata } from "next"
import { redirect } from "next/navigation"
import { type ReactNode } from "react"
import { getServerSession } from "~/lib/server/auth"
import { SidebarProvider, SidebarTrigger } from "~/shad/sidebar"
import { AdminSidebar } from "./sidebar"

export default async function Layout({ children }: { children: ReactNode }) {
    const session = await getServerSession()

    if (session?.user.role !== "ADMIN") {
        redirect("/")
    }

    return (
        <SidebarProvider className="md:h-body md:overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 overflow-auto md:h-full">
                <div className="md:hidden">
                    <SidebarTrigger className="size-10 rounded-none" />
                </div>

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
