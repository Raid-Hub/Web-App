"use client"

import {
    ChartBarBig,
    ChartBarDecreasing,
    ChartNoAxesColumnDecreasing,
    ChartNoAxesCombined,
    ChartSpline,
    HeartHandshake,
    Hourglass,
    Users,
    type LucideIcon
} from "lucide-react"
import Link from "next/link"
import D2CheckpointFlag from "~/components/icons/D2CP"
import { cn } from "~/lib/tw"

const navLinks: { title: string; href: string; icon: LucideIcon }[] = [
    { title: "Clans", href: "/clans", icon: Users },
    {
        title: "WF Rankings",
        href: "/leaderboards/individual/global/world-first-rankings",
        icon: ChartNoAxesColumnDecreasing
    },
    { title: "Weapon Meta", href: "/analytics/weapon-meta", icon: ChartNoAxesCombined },
    { title: "Population", href: "/analytics/player-population", icon: ChartSpline },
    { title: "Checkpoints", href: "/checkpoints", icon: D2CheckpointFlag },
    {
        title: "Full Clears",
        href: "/leaderboards/individual/global/full-clears",
        icon: ChartBarBig
    },
    {
        title: "Clears",
        href: "/leaderboards/individual/global/clears",
        icon: ChartBarDecreasing
    },
    {
        title: "Sherpas",
        href: "/leaderboards/individual/global/sherpas",
        icon: HeartHandshake
    },
    {
        title: "In Raid Time",
        href: "/leaderboards/individual/global/in-raid-time",
        icon: Hourglass
    }
]

const mobileTileClass =
    "border-border/50 bg-card/40 text-muted-foreground hover:border-raidhub/30 hover:text-raidhub flex flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 text-center text-xs transition-colors"

const desktopLinkClass =
    "text-muted-foreground hover:text-raidhub inline-flex items-center gap-1.5 text-sm transition-colors"

export const HomeQuickLinks = () => {
    return (
        <nav aria-label="Quick access">
            <ul className="grid grid-cols-3 gap-2 md:grid-cols-4 min-[960px]:grid-cols-5 lg:hidden">
                {navLinks.map(link => (
                    <li key={link.href}>
                        <Link href={link.href} className={mobileTileClass}>
                            <link.icon className="size-5 shrink-0" />
                            <span>{link.title}</span>
                        </Link>
                    </li>
                ))}
            </ul>

            <ul
                className={cn(
                    "border-border/40 hidden flex-wrap justify-center gap-x-5 gap-y-2 border-y py-3",
                    "lg:flex"
                )}>
                {navLinks.map(link => (
                    <li key={link.href}>
                        <Link href={link.href} className={desktopLinkClass}>
                            <link.icon className="size-4 shrink-0" />
                            {link.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
