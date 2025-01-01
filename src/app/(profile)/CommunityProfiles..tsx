import Image from "next/image"
import Link from "next/link"
import styled from "styled-components"
import { TooltipContainer, TooltipData } from "~/components/Tooltip"
import ExternalLink from "~/components/icons/ExternalLink"
import { Flex } from "~/components/layout/Flex"
import { usePageProps } from "~/components/layout/PageWrapper"
import { $media } from "../layout/media"
import { type ProfileProps } from "./types"

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
        <Flex $padding={0.5} $wrap $align="flex-start" style={{ flex: 1, minWidth: 140 }}>
            <Profile
                title="Dungeon Report"
                url={`https://dungeon.report/${membershipTypeS}/${props.destinyMembershipId}`}
                icon="https://dungeon.report/favicon.ico"
            />
            <Profile
                title="GM Report"
                url={`https://gm.report/${props.destinyMembershipId}`}
                icon="https://gm.report/apple-icon-180x180.png"
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
        </Flex>
    )
}

const Profile = ({ title, url, icon }: { title: string; url: string; icon: string }) => {
    return (
        <TooltipContainer
            tooltipId={title}
            tooltipBody={
                <TooltipData $mb={1}>
                    <Flex $padding={0} $gap={0.25}>
                        {title}
                        <ExternalLink sx={16} color="white" />
                    </Flex>
                </TooltipData>
            }>
            <ImageContainer href={url} target="_blank">
                <Image src={icon} alt={title} fill unoptimized />
            </ImageContainer>
        </TooltipContainer>
    )
}

const ImageContainer = styled(Link)`
    aspect-ratio: 1/1;
    width: 28px;
    ${$media.max.mobile`
        width: 20px;
    `}

    position: relative;
`
