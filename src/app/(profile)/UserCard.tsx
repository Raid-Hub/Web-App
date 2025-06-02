"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"
import styled from "styled-components"
import { Container } from "~/components/layout/Container"
import { Flex } from "~/components/layout/Flex"
import { usePageProps } from "~/components/layout/PageWrapper"
import { MobileDesktopSwitch } from "~/components/util/MobileDesktopSwitch"
import { useItemDefinition } from "~/hooks/dexie"
import { useClansForMember, useLinkedProfiles, useProfile } from "~/services/bungie/hooks"
import { useRaidHubResolvePlayer } from "~/services/raidhub/hooks"
import { Card } from "~/shad/card"
import { bungieBannerEmblemUrl, bungieEmblemUrl, bungieProfileIconUrl } from "~/util/destiny"
import { fixClanName } from "~/util/destiny/fixClanName"
import { getBungieDisplayName } from "~/util/destiny/getBungieDisplayName"
import { decodeHtmlEntities } from "~/util/presentation/formatting"
import { $media } from "../../lib/media"
import { trpc } from "../../lib/trpc"
import { CommunityProfiles } from "./CommunityProfiles."
import { ProfileBadge } from "./ProfileBadge"
import { UserCardSocials } from "./UserCardSocials"
import type { ProfileProps } from "./types"

export function UserCard() {
    const props = usePageProps<ProfileProps>()

    const destinyProfileQuery = useProfile(
        {
            destinyMembershipId: props.destinyMembershipId,
            membershipType: props.destinyMembershipType
        },
        {
            staleTime: 1000 * 60 * 2
        }
    )

    const bungieProfileQuery = useLinkedProfiles(
        {
            membershipId: props.destinyMembershipId
        },
        {
            select: res => res.bnetMembership
        }
    )

    const { data: raidHubUser } = trpc.profile.getUnique.useQuery(
        {
            destinyMembershipId: props.destinyMembershipId
        },
        {
            select: data => data?.user,
            // Required to prevent the query from running before the page is ready
            enabled: props.ready
        }
    )

    const { data: resolvedPlayer } = useRaidHubResolvePlayer(props.destinyMembershipId, {
        // We don't need to call this endpoint, but if we have the data, we can use it
        enabled: false
    })

    const { emblemMobileUrl, emblemHash } = useMemo(() => {
        const emblems = destinyProfileQuery?.data?.characters?.data
            ? Object.values(destinyProfileQuery.data.characters.data)[0]
            : undefined

        return {
            emblemMobileUrl: bungieEmblemUrl(emblems?.emblemBackgroundPath),
            emblemHash: emblems?.emblemHash
        }
    }, [destinyProfileQuery])

    const emblemBannerUrl = bungieBannerEmblemUrl(useItemDefinition(emblemHash ?? -1))

    const userInfo =
        destinyProfileQuery?.data?.profile.data?.userInfo ??
        bungieProfileQuery.data ??
        resolvedPlayer

    const icon =
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        raidHubUser?.image ||
        bungieProfileIconUrl(
            Object.values(destinyProfileQuery?.data?.characters.data ?? {})[0]?.emblemPath ??
                resolvedPlayer?.iconPath
        )

    const { data: clan } = useClansForMember(
        { membershipId: props.destinyMembershipId, membershipType: props.destinyMembershipType },
        {
            staleTime: 10 * 60000,
            select: res => (res.results.length > 0 ? res.results[0].group : null)
        }
    )

    const clanTitle = useMemo(
        () =>
            clan
                ? decodeHtmlEntities(fixClanName(clan.name) + ` [${clan.clanInfo.clanCallsign}]`)
                : null,
        [clan]
    )

    const [displayName, displayNameCode] = (
        userInfo ? getBungieDisplayName(userInfo) : "Guardian#0000"
    ).split("#")

    return (
        <Card $overflowHidden style={{ minWidth: "min(100%, 1300px)", maxWidth: "1300px" }}>
            <MobileDesktopSwitch
                sm={
                    <div>
                        <Container
                            $aspectRatio={{
                                width: 474,
                                height: 96
                            }}>
                            <Image
                                src={emblemMobileUrl}
                                unoptimized
                                fill
                                priority
                                alt="profile banner"
                            />
                            <BannerOverlay>
                                <Flex $crossAxis="stretch">
                                    {raidHubUser?.badges
                                        ?.slice(0, 5)
                                        .map(badge => (
                                            <ProfileBadge key={badge.id} {...badge} size={24} />
                                        ))}
                                </Flex>
                            </BannerOverlay>
                        </Container>
                        <Flex
                            $direction="row"
                            $wrap
                            $align="flex-start"
                            $padding={0}
                            $gap={0}
                            style={{
                                columnGap: "1em"
                            }}>
                            <Flex $direction="column">
                                <Flex
                                    $direction="column"
                                    $crossAxis="flex-start"
                                    $gap={0.25}
                                    $padding={0}
                                    $fullWidth>
                                    <Nameplate>
                                        {displayName}
                                        {displayNameCode && <span>#{displayNameCode}</span>}
                                    </Nameplate>
                                    {clanTitle && (
                                        <Subtitle>
                                            <Link href={`/clan/${clan!.groupId}`}>{clanTitle}</Link>
                                        </Subtitle>
                                    )}
                                </Flex>
                            </Flex>
                            <CommunityProfiles />
                        </Flex>
                    </div>
                }
                lg={
                    <div>
                        <Container
                            $aspectRatio={{
                                width: 1958,
                                height: 146
                            }}>
                            <Image
                                src={emblemBannerUrl}
                                style={{ zIndex: -1 }}
                                unoptimized
                                fill
                                priority
                                alt="profile banner"
                            />
                            <BannerOverlay>
                                <Flex $gap={1.5} $padding={0.5} $crossAxis="stretch">
                                    {raidHubUser?.badges?.map(badge => (
                                        <ProfileBadge key={badge.id} {...badge} size={32} />
                                    ))}
                                </Flex>
                            </BannerOverlay>
                        </Container>
                        <Flex
                            $direction="row"
                            $align="flex-start"
                            $padding={0.75}
                            $fullWidth
                            $wrap
                            $gap={2}>
                            <ProfilePicture>
                                <Image
                                    src={icon}
                                    alt="profile picture"
                                    fill
                                    unoptimized
                                    style={{ objectFit: "cover" }}
                                />
                            </ProfilePicture>
                            <Flex
                                $direction="column"
                                $crossAxis="flex-start"
                                $gap={0.1}
                                $padding={0.3}>
                                <Nameplate>
                                    {displayName}
                                    {displayNameCode && <span>#{displayNameCode}</span>}
                                </Nameplate>
                                {clanTitle && (
                                    <Subtitle>
                                        <Link href={`/clan/${clan!.groupId}`}>{clanTitle}</Link>
                                    </Subtitle>
                                )}
                            </Flex>
                            <UserCardSocials />
                            <CommunityProfiles />
                            {/* Rankings */}
                        </Flex>
                    </div>
                }
            />
        </Card>
    )
}

const Nameplate = styled.h1`
    margin-block: 0.1em;
    font-size: 1.5rem;
    ${$media.max.mobile`
        font-size: 1.375rem;
    `}

    color: ${({ theme }) => theme.colors.text.primary};

    & span {
        color: ${({ theme }) => theme.colors.text.secondary};
        font-weight: 400;
    }
`

const Subtitle = styled.div`
    margin-block: 0.1em;
    font-size: 1.125rem;
    ${$media.max.mobile`
        font-size: 1rem;
    `}

    & a {
        color: ${({ theme }) => theme.colors.text.secondary};
    }
`

const ProfilePicture = styled.div`
    aspect-ratio: 1 / 1;
    position: relative;

    z-index: 1;
    margin-top: -3em;

    height: 6em;

    border-radius: 50%;
    border: 1px solid color-mix(in srgb, ${({ theme }) => theme.colors.border.medium}, #0000 60%);
    overflow: hidden;

    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
    box-shadow: 0 0 0.5em
        color-mix(in srgb, ${({ theme }) => theme.colors.border.medium}, #0000 60%);

    display: flex;
`

const BannerOverlay = styled.div`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 10rem;
    ${$media.max.mobile`
        left: 25%;
    `}

    z-index: 2;
    height: 100%;
    display: flex;
`
