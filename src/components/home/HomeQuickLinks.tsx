"use client"

import {
    ChartBarBig,
    ChartBarDecreasing,
    ChartNoAxesColumnDecreasing,
    ChartNoAxesCombined,
    ChartSpline,
    HeartHandshake,
    Hourglass,
    Users
} from "lucide-react"
import Link from "next/link"
import D2CheckpointFlag from "~/components/icons/D2CP"

const navLinks = [
    {
        title: "Clan Leaderboards",
        href: "/clans",
        icon: Users
    },
    {
        title: "World First Rating Rankings",
        href: "/leaderboards/individual/global/world-first-rankings",
        icon: ChartNoAxesColumnDecreasing
    },
    {
        title: "Weapon Meta",
        href: "/analytics/weapon-meta",
        icon: ChartNoAxesCombined
    },
    {
        title: "Player Population",
        href: "/analytics/player-population",
        icon: ChartSpline
    },
    {
        title: "Checkpoints",
        href: "/checkpoints",
        icon: D2CheckpointFlag
    },
    {
        title: "Full Clears Leaderboard",
        href: "/leaderboards/individual/global/full-clears",
        icon: ChartBarBig
    },
    {
        title: "Clears Leaderboard",
        href: "/leaderboards/individual/global/clears",
        icon: ChartBarDecreasing
    },
    {
        title: "Sherpa Leaderboard",
        href: "/leaderboards/individual/global/sherpas",
        icon: HeartHandshake
    },
    {
        title: "In Raid Time Leaderboard",
        href: "/leaderboards/individual/global/in-raid-time",
        icon: Hourglass
    }
]

export const HomeQuickLinks = () => {
    return (
        <div className="6xl:max-w-520 mx-auto grid max-w-240 grid-cols-1 justify-center md:grid-cols-[repeat(auto-fit,minmax(10rem,12rem))] md:gap-3 xl:max-w-300">
            {navLinks.map((link, idx) => (
                <Link
                    key={idx}
                    href={link.href}
                    className="border-muted bg-background/60 text-muted-foreground hover:bg-raidhub/50 flex items-center gap-2 border p-2 text-center transition-colors duration-150 md:flex-col md:justify-center">
                    <link.icon className="text-primary size-8" />
                    <div className="text-sm">{link.title}</div>
                </Link>
            ))}
        </div>
    )
}
