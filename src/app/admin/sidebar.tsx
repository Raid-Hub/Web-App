"use client"

import { Badge, BadgeCheck, Database, FileWarning, type LucideProps } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "~/hooks/app/useSession"
import { Avatar, AvatarFallback, AvatarImage } from "~/shad/avatar"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "~/shad/sidebar"

interface AdminRoute {
    name: string
    path: string
    Icon: React.ComponentType<LucideProps>
}
const adminRoutes: AdminRoute[] = [
    {
        name: "Reporting",
        path: "/reporting",
        Icon: FileWarning
    },
    {
        name: "Badges",
        path: "/badges",
        Icon: Badge
    },
    {
        name: "Vanity",
        path: "/vanity",
        Icon: BadgeCheck
    },
    {
        name: "Caching",
        path: "/caching",
        Icon: Database
    }
]

export function AdminSidebar() {
    const pathname = usePathname()
    const session = useSession()

    const isActive = (path: string) => {
        return pathname === path || pathname?.startsWith(path + "/")
    }

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-white/10 py-4">
                <h1 className="px-2 text-2xl font-semibold">Admin Dashboard</h1>
            </SidebarHeader>
            <SidebarContent className="px-2 py-4">
                <SidebarMenu>
                    {adminRoutes.map(route => (
                        <SidebarMenuItem key={route.path}>
                            <SidebarMenuButton asChild isActive={isActive(route.path)}>
                                <Link href={`/admin${route.path}`}>
                                    <route.Icon className="h-4 w-4" />
                                    <span>{route.name}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            {session.data && (
                <SidebarFooter className="border-t border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="size-8 border-1 border-zinc-800 md:size-12">
                            <AvatarImage
                                className="rounded-sm"
                                src={session.data.user.image ?? ""}
                                alt={session.data.user.name ?? ""}
                            />
                            <AvatarFallback className="rounded-md bg-zinc-800">
                                {session.data.user.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{session.data.user.name}</span>
                            <span className="text-xs text-white/60">{session.data.user.id}</span>
                        </div>
                    </div>
                </SidebarFooter>
            )}
        </Sidebar>
    )
}
