/* eslint-disable react/no-unescaped-entities */
import Link from "next/link"
import { type ReactNode } from "react"
import { LeaderboardUpdateAnswer } from "./leaderboard-update"
import { WFRAnswer } from "./wfr"

export type FAQ = {
    question: string
    answer: ReactNode
}

const DotColors = [
    { title: "Green", className: "text-green-600", description: "Complete" },
    { title: "Red", className: "text-red-600", description: "Incomplete" },
    { title: "Teal", className: "text-teal-500", description: "Flawless completion" },
    { title: "Orange", className: "text-orange-600", description: "Completed without this player" },
    { title: "Gray", className: "text-gray-500", description: "Blacklisted" },
    {
        title: "White Outline",
        className: "text-white border border-gray-400 rounded-full",
        description: "Master, Prestige, or 3+ feats"
    },
    { title: "Star ⭐", className: "text-white-500", description: "Lowman" },
    { title: "Spinning Star ⭐", className: "text-white-400", description: "Solo" },
    { title: "Skull 💀", className: "text-white-400", description: "Contest" }
]

export const faqs: FAQ[] = [
    {
        question: "What do the various dot colors and symbols mean?",
        answer: (
            <ul className="list-disc pl-5">
                {DotColors.map(({ title, className, description }) => (
                    <li key={title}>
                        <span className={`font-semibold ${className}`}>{title}</span> -{" "}
                        {description}
                    </li>
                ))}
            </ul>
        )
    },
    {
        question: "What is WFR?",
        answer: <WFRAnswer />
    },
    {
        question: "How do I make my profile private?",
        answer: (
            <p>
                Navigate to your{" "}
                <Link
                    href="https://www.bungie.net/7/en/User/Account/Privacy"
                    className="text-blue-300 hover:underline">
                    Bungie.net Account Settings
                </Link>{" "}
                and toggle the{" "}
                <i className="font-semibold">Show my Destiny game Activity feed on Bungie.net</i>{" "}
                option to off. Within a few hours, when your profile is next crawled by RaidHub's
                backend, your privacy will be updated. Note that this will not hide your profile
                from other players, but it will prevent RaidHub from displaying your activity
                history and stats. It will also remove you from any individual leaderboards, and
                when logged in, your stats will appear as "unranked" on your profile.
            </p>
        )
    },
    {
        question: "What do the different rank tiers represent?",
        answer: (
            <div className="space-y-4">
                <p>
                    The leaderboard tiers are based on your position in relation to all players in
                    RaidHub's database. Each tier is broken into 5 even sized segments, I through V.
                    I is the best, while V is the lowest. The tiers are as follows:
                </p>
                <ul className="list-disc pl-5">
                    <li>
                        <strong>Top 500</strong>: The 500 highest ranked players.
                    </li>
                    <li>
                        <strong>Grandmaster</strong>: Top 0.05%
                    </li>
                    <li>
                        <strong>Master</strong>: Top 0.05% - 0.20%
                    </li>
                    <li>
                        <strong>Diamond</strong>: Top 0.20% - 0.50%
                    </li>
                    <li>
                        <strong>Platinum</strong>: Top 0.5% - 1.5%
                    </li>
                    <li>
                        <strong>Gold</strong>: Top 1.5% - 4.5%
                    </li>
                    <li>
                        <strong>Silver</strong>: Top 4.5% - 13.5%
                    </li>
                    <li>
                        <strong>Bronze</strong>: Top 13.5% - 37.5%
                    </li>
                    <li>
                        <strong>Iron</strong>: Bottom 62.5%
                    </li>
                </ul>
            </div>
        )
    },
    {
        question: "Why are my fresh clears different than on raid.report?",
        answer: (
            <p>
                During Beyond Light, the Bungie API was broken and did return information to
                determine if a raid was a fresh clear or not. As such, we deferred to marking all
                raids as checkpoint clears by default. Raid.report went the opposite route and
                marked all raids as fresh clears by default.
            </p>
        )
    },
    {
        question: "What are the Diamonds on my lowman tags?",
        answer: (
            <p>
                Tags marked with diamonds represent the highest achievable variant of a lowman based
                on number of players, raid version, and fresh vs. checkpoint.
            </p>
        )
    },
    {
        question: "What does RIIS stand for?",
        answer: (
            <p>
                <strong>RIIS</strong> stands for <em>RaidHub Individual Impact Score</em>. It is
                calculated by a formula which takes into account various factors such as your K+A/D
                and time spent in the raid. Players on a PGCR page are sorted by their RIIS
            </p>
        )
    },
    {
        question: "Why is my clears rank not updating?",
        answer: <LeaderboardUpdateAnswer />
    },
    {
        question: "I have a bug report or feature request, where do I go?",
        answer: (
            <p>
                You can submit bug reports and feature requests in our{" "}
                <Link href="https://discord.gg/raidhub" className="text-blue-300 hover:underline">
                    Discord server
                </Link>
                . We have channels set up for both bug reports and feature requests. Alternatively,
                you can submit an issue directly on our{" "}
                <Link
                    href="https://github.com/Raid-Hub/Web-App/issues"
                    className="text-blue-300 hover:underline">
                    GitHub issues page
                </Link>
                . If you are a developer yourself, you can also contribute to the project on GitHub,
                it is mostly open source and we welcome contributions from the community.
            </p>
        )
    },
    {
        question: "Is there ever going to be a Dungeon version of the site?",
        answer: <p>There are no current plans to build a Dungeon version of the site.</p>
    }
]

console.log(faqs.map(f => f.question).join("\n"))
