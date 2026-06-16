import { CloudflareIcon } from "~/components/CloudflareImage"

export function ProfileBadge(badge: {
    id: string
    name: string
    icon: string
    description: string
    size: number
}) {
    return (
        <span className="inline-flex" title={`${badge.name} — ${badge.description}`}>
            <CloudflareIcon
                path={badge.icon}
                alt={badge.name}
                width={32}
                height={32}
                objectFit="contain"
            />
        </span>
    )
}
