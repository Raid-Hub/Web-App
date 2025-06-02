import { Github, Mail, Twitter } from "lucide-react"
import Link from "next/link"
import { DiscordIcon } from "~/components/icons/DiscordIcon"
import { KofiIcon } from "~/components/icons/Kofi"

let version = "unknown"
switch (process.env.APP_ENV) {
    case "local":
        version = "local"
        break
    case "preview":
        version = `preview-${process.env.APP_VERSION}`
        break
    case "staging":
        version = `staging-${process.env.APP_VERSION}`
        break
    case "production":
        version = `${process.env.APP_VERSION}`
        break
}

const contactIcons = [
    {
        url: "https://ko-fi.com/raidhub",
        Icon: KofiIcon
    },
    {
        url: `https://discord.gg/raidhub`,
        Icon: DiscordIcon
    },
    {
        url: "https://www.twitter.com/raidhubio",
        Icon: Twitter
    },
    {
        url: "https://github.com/Raid-Hub",
        Icon: Github
    },
    {
        url: `mailto:admin@raidhub.io`,
        Icon: Mail
    }
]

export default function Footer() {
    return (
        <footer
            id="footer"
            className="bg-background/40 border-border-dark/60 h-footer mt-auto flex min-w-full justify-between overflow-hidden border-y p-2 text-sm text-zinc-500 backdrop-blur-xs">
            <div className="flex h-full flex-col items-start justify-between">
                <p>
                    Developed by{" "}
                    <Link href={`/newo`} className="font-extrabold uppercase">
                        {"Newo"}
                    </Link>
                </p>
                <p>
                    RaidHub <span className="text-zinc-400">{version}</span>
                </p>
            </div>
            <div className="flex h-full flex-col items-end justify-between">
                <div className="flex items-center justify-center gap-4">
                    {contactIcons.map(({ url, Icon }, key) => (
                        <Link
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 transition-colors hover:text-zinc-400">
                            <Icon className="size-6" />
                        </Link>
                    ))}
                </div>
                <div className="flex items-center justify-center gap-2">
                    <Link href="/privacy">Privacy</Link>
                    <Link href="/terms">Terms</Link>
                </div>
            </div>
        </footer>
    )
}
