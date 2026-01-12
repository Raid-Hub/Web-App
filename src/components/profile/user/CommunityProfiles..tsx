import { ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePageProps } from "~/components/PageWrapper"
import { type ProfileProps } from "~/lib/profile/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shad/tooltip"

const memTypeToString: Record<number, string> = {
    1: "xb",
    2: "psn",
    3: "pc",
    5: "stadia",
    6: "epic"
}

export function CommunityProfiles() {
    const props = usePageProps<ProfileProps>()

    const membershipTypeS =
        memTypeToString[props.destinyMembershipType] ?? props.destinyMembershipType

    return (
        <div className="flex flex-wrap gap-4">
            <Profile
                title="Dungeon Report"
                url={`https://dungeon.report/${membershipTypeS}/${props.destinyMembershipId}`}
                icon="https://dungeon.report/favicon.ico"
            />
            <Profile
                title="GM Report"
                url={`https://gm.report/${props.destinyMembershipId}`}
                icon="https://legacy.gm.report/apple-icon-180x180.png"
            />
            <Profile
                title="Trials Report"
                url={`https://trials.report/report/${props.destinyMembershipType}/${props.destinyMembershipId}`}
                icon="https://trials.report/favicon.ico"
            />
            <Profile
                title="Braytech"
                url={`https://bray.tech/${props.destinyMembershipType}/${props.destinyMembershipId}`}
                icon="https://bray.tech/favicon.ico"
            />
            <Profile
                title="Emblem Report"
                url={`https://emblem.report/p/${props.destinyMembershipType}/${props.destinyMembershipId}`}
                icon="https://emblem.report/favicon.ico"
            />
            <Profile
                title="Guardian Report"
                url={`https://guardian.report/?guardians=${props.destinyMembershipId}`}
                icon="https://guardian.report/favicon.ico"
            />
            <Profile
                title="Raid Report"
                url={`https://raid.report/${membershipTypeS}/${props.destinyMembershipId}`}
                icon="https://raid.report/favicon.ico"
            />
            <Profile
                title="Bungie.net"
                url={`https://www.bungie.net/7/en/User/Profile/${props.destinyMembershipType}/${props.destinyMembershipId}`}
                icon="https://www.bungie.net/favicon.ico"
            />
        </div>
    )
}

const Profile = ({ title, url, icon }: { title: string; url: string; icon: string }) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Link href={url} target="_blank" className="relative aspect-square w-5 md:w-7">
                    <Image src={icon} alt={title} fill unoptimized />
                </Link>
            </TooltipTrigger>
            <TooltipContent>
                <div className="flex items-center gap-2">
                    {title}
                    <ExternalLink className="size-4" />
                </div>
            </TooltipContent>
        </Tooltip>
    )
}
